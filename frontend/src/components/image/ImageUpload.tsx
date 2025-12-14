import React, { useState, useRef, useCallback } from 'react'
import {
  Upload,
  Button,
  Progress,
  message,
  Card,
  Image as AntImage,
  Space,
  Typography,
  Alert
} from 'antd'
import {
  InboxOutlined,
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons'
import { ImageService } from '../../services/imageService'
import { Image as ApiImage } from '../../types/api'

const { Dragger } = Upload
const { Text } = Typography

interface ImageUploadProps {
  onImageUploaded?: (image: ApiImage) => void
  onImageRemoved?: (imageId: number) => void
  maxSize?: number // 最大文件大小，单位MB
  acceptedFormats?: string[] // 支持的图片格式
  showPreview?: boolean // 是否显示预览
  multiple?: boolean // 是否支持多选
}

interface UploadingImage {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  preview?: string
  result?: ApiImage
  error?: string
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUploaded,
  onImageRemoved,
  maxSize = 10, // 默认10MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showPreview = true,
  multiple = false
}) => {
  const [uploadingImages, setUploadingImages] = useState<UploadingImage[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 验证文件
  const validateFile = (file: File): string | null => {
    // 检查文件类型
    if (!acceptedFormats.includes(file.type)) {
      return `不支持的文件格式。支持的格式：${acceptedFormats.join(', ')}`
    }

    // 检查文件大小
    const maxSizeBytes = maxSize * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `文件大小不能超过 ${maxSize}MB`
    }

    return null
  }

  // 生成预览URL
  const generatePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        resolve(e.target?.result as string)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  // 上传单个文件
  const uploadSingleFile = async (file: File, index: number) => {
    try {
      // 更新上传状态
      setUploadingImages(prev => prev.map((item, i) => 
        i === index ? { ...item, status: 'uploading' as const, progress: 0 } : item
      ))

      // 转换为Base64
      const base64Content = await ImageService.fileToBase64(file)
      
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadingImages(prev => prev.map((item, i) => 
          i === index && item.progress < 90 
            ? { ...item, progress: item.progress + 10 } 
            : item
        ))
      }, 100)

      // 上传图片
      const result = await ImageService.uploadImage({
        file,
        base64Content
      })

      clearInterval(progressInterval)

      // 更新成功状态
      setUploadingImages(prev => prev.map((item, i) => 
        i === index 
          ? { ...item, status: 'success' as const, progress: 100, result } 
          : item
      ))

      // 通知父组件
      onImageUploaded?.(result)

      message.success(`图片 ${file.name} 上传成功`)

    } catch (error) {
      console.error('Upload error:', error)
      const errorMessage = error instanceof Error ? error.message : '上传失败'
      
      // 更新错误状态
      setUploadingImages(prev => prev.map((item, i) => 
        i === index 
          ? { ...item, status: 'error' as const, error: errorMessage } 
          : item
      ))

      message.error(`图片 ${file.name} 上传失败: ${errorMessage}`)
    }
  }

  // 处理文件选择
  const handleFileSelect = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // 如果不支持多选，只取第一个文件
    const filesToProcess = multiple ? fileArray : fileArray.slice(0, 1)
    
    // 验证所有文件
    const validFiles: File[] = []
    for (const file of filesToProcess) {
      const error = validateFile(file)
      if (error) {
        message.error(`${file.name}: ${error}`)
        continue
      }
      validFiles.push(file)
    }

    if (validFiles.length === 0) {
      return
    }

    // 生成预览并添加到上传列表
    const newUploadingImages: UploadingImage[] = []
    for (const file of validFiles) {
      try {
        const preview = await generatePreview(file)
        newUploadingImages.push({
          file,
          progress: 0,
          status: 'uploading',
          preview
        })
      } catch (error) {
        console.error('Generate preview error:', error)
        newUploadingImages.push({
          file,
          progress: 0,
          status: 'uploading'
        })
      }
    }

    setUploadingImages(prev => [...prev, ...newUploadingImages])

    // 开始上传
    const startIndex = uploadingImages.length
    for (let i = 0; i < validFiles.length; i++) {
      uploadSingleFile(validFiles[i], startIndex + i)
    }
  }, [multiple, maxSize, acceptedFormats, uploadingImages.length, onImageUploaded])

  // 拖拽处理
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  // 点击上传
  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  // 文件输入变化
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files)
    }
    // 清空input值，允许重复选择同一文件
    e.target.value = ''
  }

  // 移除上传项
  const handleRemoveUploadingImage = (index: number) => {
    const item = uploadingImages[index]
    if (item.result && onImageRemoved) {
      onImageRemoved(item.result.id)
    }
    
    setUploadingImages(prev => prev.filter((_, i) => i !== index))
  }

  // 清空所有上传项
  const handleClearAll = () => {
    uploadingImages.forEach(item => {
      if (item.result && onImageRemoved) {
        onImageRemoved(item.result.id)
      }
    })
    setUploadingImages([])
  }

  return (
    <div>
      {/* 上传区域 */}
      <Card>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragOver ? '#1890ff' : '#d9d9d9'}`,
            borderRadius: '6px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: isDragOver ? '#f0f8ff' : '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onClick={handleClickUpload}
        >
          <InboxOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
          <div style={{ marginTop: '16px' }}>
            <Text strong>点击或拖拽图片到此区域上传</Text>
            <br />
            <Text type="secondary">
              支持格式：{acceptedFormats.map(format => format.split('/')[1]).join(', ')}
              <br />
              最大大小：{maxSize}MB
              {multiple && <><br />支持多文件上传</>}
            </Text>
          </div>
          
          <div style={{ marginTop: '16px' }}>
            <Button icon={<UploadOutlined />} type="primary">
              选择图片
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={handleFileInputChange}
        />
      </Card>

      {/* 上传列表 */}
      {uploadingImages.length > 0 && (
        <Card 
          title="上传列表" 
          style={{ marginTop: '16px' }}
          extra={
            <Button 
              size="small" 
              onClick={handleClearAll}
              icon={<DeleteOutlined />}
            >
              清空
            </Button>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            {uploadingImages.map((item, index) => (
              <Card 
                key={index} 
                size="small"
                style={{ 
                  backgroundColor: item.status === 'error' ? '#fff2f0' : undefined 
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {/* 预览图 */}
                  {showPreview && item.preview && (
                    <AntImage
                      src={item.preview}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover', borderRadius: '4px' }}
                      preview={{
                        mask: <EyeOutlined />
                      }}
                    />
                  )}
                  
                  {/* 文件信息 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div>
                      <Text strong>{item.file.name}</Text>
                      <Text type="secondary" style={{ marginLeft: '8px' }}>
                        ({(item.file.size / 1024 / 1024).toFixed(2)} MB)
                      </Text>
                    </div>
                    
                    {/* 进度条 */}
                    {item.status === 'uploading' && (
                      <Progress 
                        percent={item.progress} 
                        size="small" 
                        style={{ marginTop: '4px' }}
                      />
                    )}
                    
                    {/* 成功状态 */}
                    {item.status === 'success' && item.result && (
                      <div style={{ marginTop: '4px' }}>
                        <Text type="success">上传成功</Text>
                        <Text type="secondary" style={{ marginLeft: '8px' }}>
                          ID: {item.result.id}
                        </Text>
                      </div>
                    )}
                    
                    {/* 错误状态 */}
                    {item.status === 'error' && (
                      <Alert
                        message={item.error}
                        type="error"
                        size="small"
                        style={{ marginTop: '4px' }}
                      />
                    )}
                  </div>
                  
                  {/* 操作按钮 */}
                  <Button
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveUploadingImage(index)}
                    danger
                  />
                </div>
              </Card>
            ))}
          </Space>
        </Card>
      )}
    </div>
  )
}

export default ImageUpload