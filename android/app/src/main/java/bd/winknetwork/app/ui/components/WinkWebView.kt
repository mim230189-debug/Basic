package bd.winknetwork.app.ui.components

import android.annotation.SuppressLint
import android.content.Intent
import android.graphics.Bitmap
import android.net.Uri
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import bd.winknetwork.app.util.DownloadHandler

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WinkWebView(
    url: String,
    onWebViewCreated: (WebView) -> Unit,
    onProgressChange: (Int) -> Unit,
    onPageStarted: () -> Unit,
    onPageFinished: () -> Unit,
    onError: () -> Unit,
    onShowFileChooser: (ValueCallback<Array<Uri>>?, WebChromeClient.FileChooserParams?) -> Boolean,
    modifier: Modifier = Modifier
) {
    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    databaseEnabled = true
                    cacheMode = WebSettings.LOAD_DEFAULT
                    mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                    useWideViewPort = true
                    loadWithOverviewMode = true
                    setSupportZoom(false)
                    builtInZoomControls = false
                    displayZoomControls = false
                    allowFileAccess = true
                    allowContentAccess = true
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        val requestUrl = request?.url ?: return false
                        val scheme = requestUrl.scheme ?: ""

                        // Handle external app schemes natively
                        if (scheme.equals("tel", ignoreCase = true) ||
                            scheme.equals("mailto", ignoreCase = true) ||
                            scheme.equals("sms", ignoreCase = true) ||
                            requestUrl.host?.contains("whatsapp.com") == true
                        ) {
                            try {
                                val intent = Intent(Intent.ACTION_VIEW, requestUrl)
                                context.startActivity(intent)
                                return true
                            } catch (_: Exception) {
                            }
                        }

                        // Load secure web pages inside the WebView
                        return false
                    }

                    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                        super.onPageStarted(view, url, favicon)
                        onPageStarted()
                    }

                    override fun onPageFinished(view: WebView?, url: String?) {
                        super.onPageFinished(view, url)
                        onPageFinished()
                    }

                    override fun onReceivedError(
                        view: WebView?,
                        request: WebResourceRequest?,
                        error: WebResourceError?
                    ) {
                        super.onReceivedError(view, request, error)
                        // Trigger offline view if main frame network fails
                        if (request?.isForMainFrame == true) {
                            onError()
                        }
                    }
                }

                webChromeClient = object : WebChromeClient() {
                    override fun onProgressChanged(view: WebView?, newProgress: Int) {
                        super.onProgressChanged(view, newProgress)
                        onProgressChange(newProgress)
                    }

                    override fun onShowFileChooser(
                        webView: WebView?,
                        filePathCallback: ValueCallback<Array<Uri>>?,
                        fileChooserParams: FileChooserParams?
                    ): Boolean {
                        return onShowFileChooser(filePathCallback, fileChooserParams)
                    }
                }

                setDownloadListener { downloadUrl, userAgent, contentDisposition, mimetype, _ ->
                    DownloadHandler.enqueueDownload(
                        context = context,
                        url = downloadUrl,
                        userAgent = userAgent,
                        contentDisposition = contentDisposition,
                        mimetype = mimetype
                    )
                }

                onWebViewCreated(this)
                loadUrl(url)
            }
        },
        update = { webView ->
            // Update hook if needed
        }
    )
}
