import { useState, useEffect } from 'react'
import { api } from '../api'
import { UploadHistory } from '../types'

export default function SalesUpload() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<UploadHistory[]>([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    const data = await api.sales.getUploadHistory()
    setHistory(data)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult(null)

    try {
      const uploadResult = await api.sales.uploadExcel(file)
      setResult(uploadResult)
      setFile(null)
      loadHistory()
    } catch (error) {
      setResult({ success: false, error: 'Upload failed' })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="section">
      <h2>Upload Sales Data</h2>

      <div className="upload-card">
        <div className="upload-instructions">
          <h3>Excel File Requirements</h3>
          <p>Your Excel file should have the following columns:</p>
          <ul>
            <li><strong>SKU</strong> - Product SKU (must exist in your catalog)</li>
            <li><strong>Retailer</strong> - Retailer name (will be created if doesn't exist)</li>
            <li><strong>Date</strong> - Sale date (YYYY-MM-DD or Excel date)</li>
            <li><strong>Units</strong> - Number of units sold</li>
            <li><strong>Revenue</strong> - Total revenue for this sale</li>
          </ul>
          <p className="note">
            Column names are case-insensitive. Make sure products exist in your catalog before uploading.
          </p>
        </div>

        <div className="upload-form">
          <div className="file-input">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <div className="file-selected">
                Selected: <strong>{file.name}</strong>
              </div>
            )}
          </div>

          <button
            className="btn-primary"
            onClick={handleUpload}
            disabled={!file || uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Sales Data'}
          </button>
        </div>

        {result && (
          <div className={`upload-result ${result.success ? 'success' : 'error'}`}>
            {result.success ? (
              <>
                <h4>Upload Successful!</h4>
                <p>
                  Imported <strong>{result.imported}</strong> out of <strong>{result.total}</strong> records
                </p>
                {result.errors && result.errors.length > 0 && (
                  <details>
                    <summary>Show errors ({result.errors.length})</summary>
                    <ul className="error-list">
                      {result.errors.map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </details>
                )}
              </>
            ) : (
              <>
                <h4>Upload Failed</h4>
                <p>{result.error || 'An unknown error occurred'}</p>
              </>
            )}
          </div>
        )}
      </div>

      <div className="upload-history">
        <h3>Upload History</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Filename</th>
                <th>Records</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map(item => (
                <tr key={item.id}>
                  <td>{new Date(item.upload_date).toLocaleString()}</td>
                  <td>{item.filename}</td>
                  <td>{item.records_imported}</td>
                  <td>
                    <span className={`badge status-${item.status}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && (
            <div className="empty-state">No uploads yet</div>
          )}
        </div>
      </div>

      <div className="download-template">
        <h3>Need a Template?</h3>
        <p>Download a sample Excel template to get started:</p>
        <button
          className="btn-primary"
          onClick={() => {
            const csvContent = 'SKU,Retailer,Date,Units,Revenue\nSAMPLE001,Target,2026-01-15,100,2500.00\nSAMPLE002,Walmart,2026-01-15,50,1200.00'
            const blob = new Blob([csvContent], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'sales_template.csv'
            a.click()
          }}
        >
          Download Template
        </button>
      </div>
    </div>
  )
}
