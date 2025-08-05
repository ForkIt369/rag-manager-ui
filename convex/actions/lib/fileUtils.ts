"use node"

import { fileTypeFromBuffer } from 'file-type'
import { createHash } from 'crypto'

export interface FileInfo {
  fileName: string
  fileType: string
  mimeType: string
  fileSize: number
  hash: string
}

export async function detectFileType(buffer: Buffer): Promise<{
  mime: string
  ext: string
}> {
  const fileType = await fileTypeFromBuffer(buffer)
  
  if (fileType) {
    return { mime: fileType.mime, ext: fileType.ext }
  }
  
  // Fallback for text files
  const textContent = buffer.toString('utf-8', 0, Math.min(1000, buffer.length))
  if (isProbablyText(textContent)) {
    return { mime: 'text/plain', ext: 'txt' }
  }
  
  return { mime: 'application/octet-stream', ext: 'bin' }
}

function isProbablyText(content: string): boolean {
  // Check if content is mostly printable characters
  const printableChars = content.match(/[\x20-\x7E\n\r\t]/g)
  return printableChars ? printableChars.length / content.length > 0.95 : false
}

export function getFileHash(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex')
}

export function parseFileSize(sizeStr: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  }
  
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)?$/i)
  
  if (!match) {
    throw new Error(`Invalid file size format: ${sizeStr}`)
  }
  
  const value = parseFloat(match[1])
  const unit = (match[2] || 'B').toUpperCase()
  
  return Math.floor(value * (units[unit] || 1))
}

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`
}

export function getFileExtension(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase()
  return ext.startsWith('.') ? ext.slice(1) : ext
}

export function getMimeType(fileName: string): string {
  const ext = getFileExtension(fileName)
  
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    csv: 'text/csv',
    txt: 'text/plain',
    md: 'text/markdown',
    html: 'text/html',
    htm: 'text/html',
    json: 'application/json',
    xml: 'application/xml',
    epub: 'application/epub+zip',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
  }
  
  return mimeTypes[ext] || 'application/octet-stream'
}

export function isTextFile(mimeType: string): boolean {
  return mimeType.startsWith('text/') || 
         mimeType === 'application/json' ||
         mimeType === 'application/xml'
}

export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

export function isOfficeFile(mimeType: string): boolean {
  return mimeType.includes('officedocument') ||
         mimeType.includes('msword') ||
         mimeType.includes('ms-excel')
}

export async function validateFile(
  buffer: Buffer,
  fileName: string,
  maxSize?: number
): Promise<FileInfo> {
  const fileSize = buffer.length
  const maxFileSize = maxSize || parseFileSize(process.env.MAX_FILE_SIZE || '100MB')
  
  if (fileSize > maxFileSize) {
    throw new Error(`File size ${formatFileSize(fileSize)} exceeds maximum allowed size of ${formatFileSize(maxFileSize)}`)
  }
  
  const { mime, ext } = await detectFileType(buffer)
  const hash = getFileHash(buffer)
  
  return {
    fileName,
    fileType: ext,
    mimeType: mime,
    fileSize,
    hash
  }
}