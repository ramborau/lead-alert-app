'use client'

import { useState, useEffect } from 'react'
import { Facebook, CheckCircle, Send, Link, FileText, AlertCircle } from 'lucide-react'

interface Config {
  webhookUrl?: string
  pageId?: string
  pageName?: string
  formId?: string
  formName?: string
  accessToken?: string
  leadCount?: number
}

export default function SimplePage() {
  const [config, setConfig] = useState<Config>({})
  const [webhookInput, setWebhookInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [testResult, setTestResult] = useState<string | null>(null)

  useEffect(() => {
    // Load config from localStorage
    const savedConfig = localStorage.getItem('simple-lead-config')
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig))
    }
  }, [])

  const saveConfig = (newConfig: Config) => {
    setConfig(newConfig)
    localStorage.setItem('simple-lead-config', JSON.stringify(newConfig))
  }

  const handleSetWebhook = () => {
    if (!webhookInput) {
      setError('Please enter a webhook URL')
      return
    }
    
    try {
      new URL(webhookInput)
      saveConfig({ ...config, webhookUrl: webhookInput })
      setError('')
    } catch (e) {
      setError('Please enter a valid URL')
    }
  }

  const handleConnectFacebook = () => {
    if (!config.webhookUrl) {
      setError('Please set webhook URL first')
      return
    }
    
    // Store webhook URL in session storage for callback
    sessionStorage.setItem('simple-webhook-url', config.webhookUrl)
    
    // Redirect to Facebook OAuth
    const params = new URLSearchParams({
      webhook_url: config.webhookUrl
    })
    window.location.href = `/simple/api/facebook/connect?${params.toString()}`
  }

  const handleTestWebhook = async () => {
    if (!config.webhookUrl) {
      setError('No webhook URL configured')
      return
    }

    setLoading(true)
    setTestResult(null)
    
    try {
      const response = await fetch('/simple/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhookUrl: config.webhookUrl })
      })
      
      const data = await response.json()
      if (response.ok) {
        setTestResult('✅ Webhook test successful!')
      } else {
        setTestResult(`❌ Test failed: ${data.error}`)
      }
    } catch (error) {
      setTestResult('❌ Failed to test webhook')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    localStorage.removeItem('simple-lead-config')
    setConfig({})
    setWebhookInput('')
    setError('')
    setTestResult(null)
  }

  // Check if fully configured
  const isConfigured = config.webhookUrl && config.pageId && config.formId

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Simple Lead Forwarder
          </h1>
          <p className="text-gray-600">
            Forward Facebook leads to your webhook - No signup required
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          {!isConfigured ? (
            <>
              {/* Step 1: Webhook URL */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    config.webhookUrl ? 'bg-green-500' : 'bg-gray-300'
                  }`}>
                    {config.webhookUrl ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-white font-bold">1</span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold">Enter Webhook URL</h2>
                </div>
                
                {!config.webhookUrl ? (
                  <div className="ml-10 space-y-3">
                    <input
                      type="url"
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                      placeholder="https://your-webhook-url.com/endpoint"
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleSetWebhook}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      <Send className="inline w-4 h-4 mr-2" />
                      Set Webhook URL
                    </button>
                  </div>
                ) : (
                  <div className="ml-10 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <Link className="inline w-4 h-4 mr-1" />
                      {config.webhookUrl}
                    </p>
                  </div>
                )}
              </div>

              {/* Step 2: Connect Facebook */}
              {config.webhookUrl && !config.pageId && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-white font-bold">2</span>
                    </div>
                    <h2 className="text-lg font-semibold">Connect Facebook</h2>
                  </div>
                  
                  <div className="ml-10">
                    <button
                      onClick={handleConnectFacebook}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center"
                    >
                      <Facebook className="w-5 h-5 mr-2" />
                      Connect Facebook Account
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      You'll select your page and form after connecting
                    </p>
                  </div>
                </div>
              )}

              {/* Step 3: Configuration in progress */}
              {config.pageId && !config.formId && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center">
                      <span className="text-white font-bold">3</span>
                    </div>
                    <h2 className="text-lg font-semibold">Select Form</h2>
                  </div>
                  
                  <div className="ml-10 p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle className="inline w-4 h-4 mr-1" />
                      Redirecting to form selection...
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}
            </>
          ) : (
            /* Dashboard View */
            <div className="space-y-6">
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Lead Forwarding Active
                </h2>
              </div>

              {/* Status Cards */}
              <div className="grid gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Facebook className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Facebook Page</p>
                        <p className="font-semibold">{config.pageName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-6 h-6 text-purple-600" />
                      <div>
                        <p className="text-xs text-gray-600">Lead Form</p>
                        <p className="font-semibold">{config.formName}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Link className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="text-xs text-gray-600">Webhook URL</p>
                        <p className="font-semibold text-sm truncate">{config.webhookUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Send className="w-6 h-6 text-yellow-600" />
                      <div>
                        <p className="text-xs text-gray-600">Leads Forwarded</p>
                        <p className="text-2xl font-bold">{config.leadCount || 0}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleTestWebhook}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {loading ? 'Testing...' : 'Test Webhook'}
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                >
                  Reset Configuration
                </button>
              </div>

              {testResult && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm">{testResult}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center py-6 text-sm text-gray-600">
          <p>No data is stored. Leads are forwarded directly to your webhook.</p>
        </div>
      </div>
    </div>
  )
}