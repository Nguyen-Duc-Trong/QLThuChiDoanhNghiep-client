import { useId, useRef } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Check, Upload, X } from 'lucide-react'
import { colors, tones } from '../../theme/tokens'

function formatSize(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/**
 * Trường chứng từ: hiển thị tệp đã chọn, ô trống báo lỗi, nút "Tải thêm chứng từ".
 * files: [{ name, size }] (size tính bằng byte) — onChange nhận mảng mới (gồm cả File gốc).
 */
export default function FileUploadField({
  label,
  required,
  files = [],
  onChange,
  error,
  placeholder = 'Chọn tệp',
  accept,
  multiple = true,
  buttonLabel = 'Tải thêm chứng từ',
  showButton = true,
}) {
  const inputRef = useRef(null)
  const inputId = useId()

  const handleSelect = (event) => {
    const picked = Array.from(event.target.files ?? []).map((file) => ({ name: file.name, size: file.size, file }))
    onChange?.(multiple ? [...files, ...picked] : picked.slice(0, 1))
    event.target.value = ''
  }

  const removeAt = (index) => onChange?.(files.filter((_, i) => i !== index))

  return (
    <Box>
      {label && (
        <Typography component="label" htmlFor={inputId} sx={{ display: 'block', fontSize: 12, fontWeight: 600, mb: 0.75 }}>
          {label}
          {required && ' *'}
        </Typography>
      )}

      <Stack spacing={1}>
        {files.map((f, index) => (
          <Stack
            key={`${f.name}-${index}`}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', border: `1px solid ${colors.border}`, borderRadius: 2, px: 1.5, minHeight: 42 }}
          >
            <Typography sx={{ fontSize: 14, flex: 1, minWidth: 0 }} noWrap>
              {f.name}
              {f.size ? ` · ${formatSize(f.size)}` : ''}
            </Typography>
            <Check size={14} color={tones.success.fg} />
            <IconButton size="small" aria-label={`Xóa ${f.name}`} onClick={() => removeAt(index)}>
              <X size={14} />
            </IconButton>
          </Stack>
        ))}

        {files.length === 0 && (
          <Box
            component="button"
            type="button"
            onClick={() => inputRef.current?.click()}
            sx={{
              textAlign: 'left',
              font: 'inherit',
              fontSize: 14,
              cursor: 'pointer',
              bgcolor: colors.surface,
              color: colors.textMuted,
              border: `1px solid ${error ? tones.danger.fg : colors.border}`,
              borderRadius: 2,
              px: 1.5,
              minHeight: 42,
            }}
          >
            {placeholder}
          </Box>
        )}
      </Stack>

      {error && <Typography sx={{ fontSize: 12, color: tones.danger.fg, mt: 0.75 }}>{error}</Typography>}

      <input id={inputId} ref={inputRef} type="file" hidden accept={accept} multiple={multiple} onChange={handleSelect} />

      {showButton && (
        <Button variant="outlined" startIcon={<Upload size={16} />} onClick={() => inputRef.current?.click()} sx={{ mt: 2 }}>
          {buttonLabel}
        </Button>
      )}
    </Box>
  )
}
