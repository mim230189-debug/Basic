package bd.winknetwork.app.ui

import android.net.Uri
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebView
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import bd.winknetwork.app.Constants
import bd.winknetwork.app.ui.components.OfflineScreen
import bd.winknetwork.app.ui.components.SplashScreen
import bd.winknetwork.app.ui.components.WinkWebView
import bd.winknetwork.app.ui.theme.WinkOrange
import bd.winknetwork.app.util.NetworkMonitor

@Composable
fun WinkAppScaffold(
    onShowFileChooser: (ValueCallback<Array<Uri>>?, WebChromeClient.FileChooserParams?) -> Boolean,
    onExitApp: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val networkMonitor = remember { NetworkMonitor(context) }
    val isNetworkOnline by networkMonitor.isOnlineFlow.collectAsState(initial = networkMonitor.isConnected())

    var isSplashVisible by remember { mutableStateOf(true) }
    var webViewInstance by remember { mutableStateOf<WebView?>(null) }
    var loadProgress by remember { mutableIntStateOf(0) }
    var isPageLoading by remember { mutableStateOf(false) }
    var isWebError by remember { mutableStateOf(false) }

    // Intercept back navigation: navigate webview history before allowing app exit
    BackHandler(enabled = !isSplashVisible) {
        if (webViewInstance?.canGoBack() == true) {
            webViewInstance?.goBack()
        } else {
            onExitApp()
        }
    }

    // Auto-reload webview when network comes back online
    LaunchedEffect(isNetworkOnline) {
        if (isNetworkOnline && isWebError) {
            isWebError = false
            webViewInstance?.reload()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .statusBarsPadding()
    ) {
        // Main Web View Container
        WinkWebView(
            url = Constants.DEFAULT_URL,
            onWebViewCreated = { webView ->
                webViewInstance = webView
            },
            onProgressChange = { progress ->
                loadProgress = progress
                isPageLoading = progress in 1..99
            },
            onPageStarted = {
                isPageLoading = true
                isWebError = false
            },
            onPageFinished = {
                isPageLoading = false
            },
            onError = {
                isWebError = true
                isPageLoading = false
            },
            onShowFileChooser = onShowFileChooser
        )

        // Web Loading Progress Bar at top edge
        if (isPageLoading && !isSplashVisible && !isWebError) {
            LinearProgressIndicator(
                progress = { loadProgress / 100f },
                color = WinkOrange,
                trackColor = Color.Transparent,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(3.dp)
                    .align(Alignment.TopCenter)
            )
        }

        // Offline Screen overlay when disconnected or webview failed to load
        if (!isNetworkOnline || isWebError) {
            OfflineScreen(
                onRetry = {
                    isWebError = false
                    webViewInstance?.reload()
                }
            )
        }

        // Animated Splash Screen overlay on launch
        AnimatedVisibility(
            visible = isSplashVisible,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            SplashScreen(
                onSplashFinished = {
                    isSplashVisible = false
                }
            )
        }
    }
}
