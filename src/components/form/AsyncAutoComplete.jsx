import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ChevronDown, X } from 'lucide-react'
import FormTextField from './FormTextField'
import ConfirmDialog from '../feedback/ConfirmDialog'
import useToast from '../feedback/useToast'
import { TOAST_OPTIONS } from '../feedback/toastContext'
import axiosInstance from '../../utils/axiosInstance'
import { colors, radius } from '../../theme/tokens'

const DEFAULT_LIMIT_TAGS = 3

const toArray = (value) => (Array.isArray(value) ? value : value === null || value === undefined || value === '' ? [] : [value])

function extractItems(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

// Query string cho GET: tham số tìm kiếm (chỉ gửi khi có từ khóa, trừ khi sendEmptyQueryParam) + page/limit.
function buildSearchParams({ search, queryParam, queryParams, useFilterParam, sendEmptyQueryParam, limit }) {
  const params = new URLSearchParams()
  if (search || sendEmptyQueryParam) {
    const names = queryParams?.length ? queryParams : [queryParam || 'q']
    names.forEach((name) => params.append(useFilterParam ? `filter[${name}]` : name, search ?? ''))
  }
  params.set('page', '1')
  params.set('limit', String(limit))
  return params
}

/**
 * Ô chọn có tìm kiếm, tự tải danh sách lựa chọn từ API (hoặc từ hàm fetchOptions / mảng options cố định).
 *
 * Nguồn dữ liệu (chọn một):
 * - url: GET `${url}?q=...&page=1&limit=20` (POST nếu method="POST" hoặc có body). Response là mảng, `{ data: [] }` hoặc `{ items: [] }`.
 * - fetchOptions({ search, page, limit }): hàm tự lấy dữ liệu (dữ liệu mẫu, API đặc thù...).
 * - options: mảng cố định, lọc tại client theo nhãn.
 *
 * Giá trị:
 * - value / onChange: object (returnObject, mặc định) hoặc chỉ id (returnObject={false}); mảng khi isMulti.
 * - Khi value là id chưa có trong danh sách, tự gọi GET `${url}/${id}` (hoặc fetchById) để lấy nhãn hiển thị.
 *
 * Hiển thị:
 * - optionLabel / optionValue: tên thuộc tính làm nhãn / định danh (mặc định "label" / "id").
 * - useCombinedLabel + combinedLabelField: nhãn dạng "Tên - Trường mở rộng".
 * - optionSubLabel: hiển thị 2 dòng; true = tách nhãn theo " - ", chuỗi = tên thuộc tính làm dòng phụ.
 * - isMulti + limitTags: hiện tối đa n chip, phần còn lại gom vào "+N", bấm để xem / bỏ bớt trong dialog.
 * - allowOtherOption: thêm lựa chọn "--Khác--" cuối danh sách.
 * - onDeleteOption + urlDelete(option) (+ deleteCondition): nút xóa từng lựa chọn trong danh sách.
 *
 * <AsyncAutoComplete label="Người thụ hưởng" url="beneficiaries" optionLabel="name" value={value} onChange={setValue} />
 */
export default function AsyncAutoComplete({
  url,
  fetchOptions,
  fetchById,
  options: staticOptions,
  value,
  onChange,
  label,
  formLabel,
  placeholder,
  required,
  disabled,
  error,
  helperText,
  heplText,
  optionLabel = 'label',
  optionValue = 'id',
  isMulti = false,
  returnObject = true,
  loadOnMount = false,
  limit = 20,
  limitTags,
  queryParam,
  queryParams,
  useFilterParam = false,
  sendEmptyQueryParam = false,
  method = 'GET',
  body,
  debounceTime = 300,
  useCombinedLabel = false,
  combinedLabelField,
  optionSubLabel = false,
  hideDropdownIcon,
  dataSelectedOptions,
  onDeleteOption = false,
  urlDelete,
  deleteCondition,
  allowOtherOption = false,
  otherOptionValue = 'OTHER',
  otherOptionLabel = '--Khác--',
  size = 'small',
  sx,
  ...rest
}) {
  const showToast = useToast()
  const isRemote = Boolean(url || fetchOptions)

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [typing, setTyping] = useState(false)
  const [loading, setLoading] = useState(false)
  // Danh sách tải về gắn với url đã tải; đổi url thì danh sách cũ tự bị bỏ qua.
  const [fetched, setFetched] = useState({ source: null, items: [] })
  // Lựa chọn đã từng thấy (kết quả tìm kiếm, giá trị đã chọn, giá trị tải theo id), dùng để hiển thị nhãn khi value chỉ là id.
  const [known, setKnown] = useState({})
  const [failedIds, setFailedIds] = useState({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [draft, setDraft] = useState([])

  const fetchedSourceRef = useRef(null)
  const latestRequestRef = useRef(0)
  const searchTimeoutRef = useRef(null)

  const getKey = useCallback(
    (option) => {
      if (option === null || option === undefined) return null
      if (typeof option !== 'object') return String(option)
      const raw = option[optionValue] ?? option.value ?? option.id ?? option.code ?? option._id
      return raw === null || raw === undefined ? null : String(raw)
    },
    [optionValue],
  )

  const otherItem = useMemo(
    () => ({ [optionValue]: otherOptionValue, [optionLabel]: otherOptionLabel, isOther: true }),
    [optionValue, optionLabel, otherOptionValue, otherOptionLabel],
  )

  const remember = useCallback(
    (items) => {
      const list = toArray(items).filter((item) => item && typeof item === 'object' && getKey(item))
      if (list.length === 0) return
      setKnown((prev) => ({ ...prev, ...Object.fromEntries(list.map((item) => [getKey(item), item])) }))
    },
    [getKey],
  )

  const fetchData = useCallback(
    async (search) => {
      if (!isRemote) return
      const requestId = ++latestRequestRef.current
      fetchedSourceRef.current = url ?? 'fetchOptions'
      setLoading(true)
      // Tránh hiện kết quả cũ trong lúc chờ kết quả của từ khóa mới.
      if (search) setFetched((prev) => ({ ...prev, items: [] }))

      try {
        let response
        if (fetchOptions) {
          response = await fetchOptions({ search, page: 1, limit })
        } else if (method === 'POST' || body) {
          response = await axiosInstance.post(url, { ...body, [queryParam || 'q']: search || '', page: 1, limit })
        } else {
          const params = buildSearchParams({ search, queryParam, queryParams, useFilterParam, sendEmptyQueryParam, limit })
          response = await axiosInstance.get(url, { params })
        }
        // Response của lần gọi cũ về sau lần gọi mới thì bỏ qua.
        if (requestId !== latestRequestRef.current) return

        const seen = new Set()
        const items = extractItems(response).filter((item) => {
          const key = getKey(item)
          if (!key || seen.has(key)) return false
          seen.add(key)
          return true
        })
        remember(items)
        setFetched({ source: fetchedSourceRef.current, items })
      } catch (err) {
        if (requestId !== latestRequestRef.current) return
        setFetched({ source: fetchedSourceRef.current, items: [] })
        showToast(err?.response?.data?.message || err?.message || 'Lỗi khi tải dữ liệu', 'error', TOAST_OPTIONS.fromError(err))
      } finally {
        if (requestId === latestRequestRef.current) setLoading(false)
      }
    },
    [isRemote, url, fetchOptions, method, body, queryParam, queryParams, useFilterParam, sendEmptyQueryParam, limit, getKey, remember, showToast],
  )

  const ensureLoaded = useCallback(() => {
    if (fetchedSourceRef.current !== (url ?? 'fetchOptions')) fetchData('')
  }, [fetchData, url])

  useEffect(() => {
    if (loadOnMount) ensureLoaded()
  }, [loadOnMount, ensureLoaded])

  useEffect(() => () => clearTimeout(searchTimeoutRef.current), [])

  // Giá trị là id nhưng chưa biết nhãn: tải từng id (GET `${url}/${id}` hoặc fetchById).
  const missingIds = toArray(value)
    .filter((v) => typeof v !== 'object')
    .map(String)
    .filter((id) => !known[id] && !failedIds[id] && !(allowOtherOption && id === String(otherOptionValue)))
  const missingKey = missingIds.join('|')
  const canFetchById = Boolean(fetchById || url)

  // Callback truyền inline đổi mỗi lần render; giữ bản mới nhất trong ref để không gọi lại API theo từng render.
  const callbacksRef = useRef({ fetchById, dataSelectedOptions })
  useEffect(() => {
    callbacksRef.current = { fetchById, dataSelectedOptions }
  })

  useEffect(() => {
    if (!missingKey || !canFetchById) return undefined
    let cancelled = false
    const { fetchById: loadById, dataSelectedOptions: notifySelected } = callbacksRef.current
    const [path, query] = String(url ?? '').split('?')
    const loadOne = loadById ?? ((id) => axiosInstance.get(`${path.replace(/\/$/, '')}/${encodeURIComponent(id)}${query ? `?${query}` : ''}`))
    const ids = missingKey.split('|')

    Promise.allSettled(ids.map((id) => loadOne(id))).then((results) => {
      if (cancelled) return
      const found = []
      const failed = {}
      results.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) found.push(result.value)
        else {
          failed[ids[index]] = true
          if (result.status === 'rejected') console.error('AsyncAutoComplete: không tải được giá trị ban đầu', ids[index], result.reason)
        }
      })
      remember(found)
      if (Object.keys(failed).length) setFailedIds((prev) => ({ ...prev, ...failed }))
      if (found.length && notifySelected) notifySelected(isMulti ? found : found[0])
    })
    return () => {
      cancelled = true
    }
  }, [missingKey, canFetchById, url, remember, isMulti])

  const lookup = useCallback(
    (val) => {
      if (val === null || val === undefined || val === '') return null
      if (typeof val === 'object') return val
      if (allowOtherOption && String(val) === String(otherOptionValue)) return otherItem
      return known[String(val)] ?? (staticOptions ?? []).find((o) => getKey(o) === String(val)) ?? null
    },
    [known, staticOptions, getKey, allowOtherOption, otherOptionValue, otherItem],
  )

  const resolvedValue = useMemo(() => {
    if (isMulti) return toArray(value).map(lookup).filter(Boolean)
    return lookup(Array.isArray(value) ? value[0] : value)
  }, [value, isMulti, lookup])

  const displayOptions = useMemo(() => {
    const base = isRemote ? (fetched.source === (url ?? 'fetchOptions') ? fetched.items : []) : (staticOptions ?? [])
    const list = [...base]
    const keys = new Set(list.map(getKey))
    // Luôn giữ giá trị đang chọn trong danh sách để MUI so khớp được.
    toArray(resolvedValue).forEach((option) => {
      const key = getKey(option)
      if (key && !keys.has(key)) {
        list.push(option)
        keys.add(key)
      }
    })
    if (allowOtherOption && !keys.has(String(otherOptionValue))) list.push(otherItem)
    return list
  }, [isRemote, fetched, url, staticOptions, resolvedValue, getKey, allowOtherOption, otherOptionValue, otherItem])

  const getLabel = useCallback(
    (option) => {
      if (option === null || option === undefined) return ''
      const item = typeof option === 'object' ? option : lookup(option)
      if (!item) return String(option)
      const base = String(item[optionLabel] ?? getKey(item) ?? '')
      const extra = useCombinedLabel && combinedLabelField ? item[combinedLabelField] : null
      return extra === null || extra === undefined || extra === '' ? base : `${base} - ${extra}`
    },
    [lookup, optionLabel, getKey, useCombinedLabel, combinedLabelField],
  )

  const splitLabel = useCallback(
    (option) => {
      const full = getLabel(option)
      if (!optionSubLabel) return { main: full, sub: null }
      if (typeof optionSubLabel === 'string' && option?.[optionSubLabel]) return { main: full, sub: option[optionSubLabel] }
      const [main, ...others] = full.split(' - ')
      return { main, sub: others.join(' - ') || null }
    },
    [getLabel, optionSubLabel],
  )

  const toOutput = (option) => (returnObject ? option : (option?.isOther ? otherOptionValue : getKey(option)))

  const handleOpen = () => {
    setOpen(true)
    ensureLoaded()
  }

  const handleClose = () => {
    clearTimeout(searchTimeoutRef.current)
    setOpen(false)
    // Đóng khi đang tìm thì tải lại danh sách mặc định cho lần mở sau.
    if (typing) fetchData('')
    setTyping(false)
    setInputValue('')
  }

  const handleInputChange = (_, next, reason) => {
    if (reason === 'input') {
      setTyping(true)
      setInputValue(next)
      clearTimeout(searchTimeoutRef.current)
      if (isRemote) searchTimeoutRef.current = setTimeout(() => fetchData(next), debounceTime)
    } else if (reason === 'clear') {
      clearTimeout(searchTimeoutRef.current)
      setTyping(false)
      setInputValue('')
    }
    // reason 'reset' (chọn xong / value đổi từ ngoài): ô nhập tự hiển thị nhãn của value, xem `shownInput`.
  }

  const handleChange = (_, next) => {
    remember(next)
    dataSelectedOptions?.(next)
    setTyping(false)
    setInputValue('')
    if (isMulti) {
      onChange?.((next ?? []).map(toOutput))
      // Chọn xong một mục khi đang tìm: tải lại danh sách mặc định cho các lựa chọn còn lại.
      if (typing) fetchData('')
    } else {
      onChange?.(next ? toOutput(next) : null)
    }
  }

  const handleDeleteOption = async (option) => {
    try {
      await urlDelete(option)
      const deletedKey = getKey(option)
      setFetched((prev) => ({ ...prev, items: prev.items.filter((o) => getKey(o) !== deletedKey) }))
      showToast('Xóa thành công', 'success')
    } catch (err) {
      showToast('Xóa thất bại', 'error', TOAST_OPTIONS.fromError(err))
    }
  }

  const openDialog = (event) => {
    event.preventDefault()
    event.stopPropagation()
    setDraft(toArray(resolvedValue))
    setDialogOpen(true)
  }

  const saveDialog = () => {
    onChange?.(draft.map(toOutput))
    setDialogOpen(false)
  }

  const filterOptions = isRemote
    ? (list) => list
    : (list, state) => {
        const keyword = state.inputValue.trim().toLowerCase()
        if (!keyword) return list
        return list.filter((option) => {
          const { main, sub } = splitLabel(option)
          return main.toLowerCase().includes(keyword) || String(sub ?? '').toLowerCase().includes(keyword)
        })
      }

  const renderTwoLines = (option) => {
    const { main, sub } = splitLabel(option)
    return (
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ fontSize: 13, fontWeight: sub ? 600 : 400, lineHeight: 1.3 }} noWrap>{main}</Typography>
        {sub && (
          <Typography sx={{ fontSize: 11, color: colors.textSecondary, textTransform: 'uppercase', mt: 0.25, lineHeight: 1.3 }} noWrap>
            {sub}
          </Typography>
        )}
      </Box>
    )
  }

  const renderOption = ({ key, ...optionProps }, option) => {
    const showDelete = onDeleteOption && urlDelete && !option.isOther && (!deleteCondition || deleteCondition(option))
    return (
      <Box component="li" key={getKey(option) ?? key} {...optionProps} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {renderTwoLines(option)}
        {showDelete && (
          <IconButton
            size="small"
            aria-label={`Xóa ${getLabel(option)}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={(event) => {
              event.stopPropagation()
              handleDeleteOption(option)
            }}
            sx={{ color: colors.textMuted, '&:hover': { color: 'error.main' } }}
          >
            <X size={14} />
          </IconButton>
        )}
      </Box>
    )
  }

  const renderMultiValue = (selected, getItemProps) => {
    const maxToShow = Number(limitTags) || DEFAULT_LIMIT_TAGS
    const hiddenCount = selected.length - maxToShow
    return (
      <>
        {selected.slice(0, maxToShow).map((option, index) => {
          const { key, onDelete, ...itemProps } = getItemProps({ index })
          const { main, sub } = splitLabel(option)
          return (
            <Tooltip key={key} title={sub ? `${main} - ${sub}` : main}>
              <Chip
                {...itemProps}
                size="small"
                label={main}
                onDelete={disabled ? undefined : onDelete}
                sx={{ maxWidth: 160, borderRadius: `${radius.sm}px` }}
              />
            </Tooltip>
          )
        })}
        {hiddenCount > 0 && (
          <Chip
            size="small"
            color="primary"
            label={`+${hiddenCount}`}
            onMouseDown={(event) => event.preventDefault()}
            onClick={openDialog}
            aria-label={`Xem thêm ${hiddenCount} lựa chọn`}
            sx={{ fontWeight: 600 }}
          />
        )}
      </>
    )
  }

  const hideIcon = hideDropdownIcon ?? Boolean(disabled)
  const missingLoading = missingIds.length > 0 && canFetchById
  // Ô nhập luôn được kiểm soát: đang gõ thì là từ khóa, không thì là nhãn của giá trị (chọn đơn) hoặc rỗng (chọn nhiều).
  const shownInput = typing ? inputValue : isMulti ? '' : getLabel(resolvedValue)

  return (
    <>
      <Autocomplete
        multiple={isMulti}
        value={resolvedValue}
        options={displayOptions}
        open={open}
        onOpen={handleOpen}
        onClose={handleClose}
        onChange={handleChange}
        inputValue={shownInput}
        onInputChange={handleInputChange}
        filterOptions={filterOptions}
        filterSelectedOptions={isMulti}
        getOptionLabel={getLabel}
        isOptionEqualToValue={(option, val) => getKey(option) !== null && getKey(option) === getKey(val)}
        renderOption={renderOption}
        renderValue={isMulti ? renderMultiValue : undefined}
        loading={loading}
        loadingText="Đang tải..."
        noOptionsText="Không tìm thấy kết quả"
        disabled={disabled}
        disableClearable={rest.disableClearable ?? Boolean(disabled && optionSubLabel)}
        forcePopupIcon={hideIcon ? false : 'auto'}
        popupIcon={<ChevronDown size={16} />}
        size={size}
        sx={sx}
        renderInput={(params) => (
          <FormTextField
            {...params}
            label={label}
            required={required}
            placeholder={isMulti && toArray(resolvedValue).length > 0 ? '' : placeholder}
            error={error}
            helperText={helperText ?? heplText}
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                endAdornment: (
                  <>
                    {(loading || missingLoading) && <CircularProgress size={16} sx={{ mr: 1 }} />}
                    {params.slotProps.input.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
        {...rest}
      />

      {isMulti && (
        <ConfirmDialog
          open={dialogOpen}
          title={formLabel || label || 'Các lựa chọn'}
          description={`${draft.length} lựa chọn`}
          confirmLabel="Lưu"
          confirmDisabled={disabled}
          onClose={() => setDialogOpen(false)}
          onConfirm={saveDialog}
        >
          <Stack spacing={1} sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {draft.map((option) => (
              <Stack
                key={getKey(option)}
                direction="row"
                spacing={1}
                sx={{ alignItems: 'center', px: 1.5, py: 1, bgcolor: colors.surfaceMuted, border: `1px solid ${colors.border}`, borderRadius: `${radius.sm}px` }}
              >
                {renderTwoLines(option)}
                {!disabled && (
                  <IconButton
                    size="small"
                    aria-label={`Bỏ ${getLabel(option)}`}
                    onClick={() => setDraft((prev) => prev.filter((o) => getKey(o) !== getKey(option)))}
                  >
                    <X size={14} />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
        </ConfirmDialog>
      )}
    </>
  )
}
