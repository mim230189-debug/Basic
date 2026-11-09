package bd.winknetwork.app.util

import android.app.DownloadManager
import android.content.Context
import android.net.Uri
import android.os.Environment
import android.webkit.URLUtil
import android.widget.Toast
import bd.winknetwork.app.R

/**
 * Handles downloading PDF invoices, payment receipts, and reports via Android DownloadManager.
 */
object DownloadHandler {

    fun enqueueDownload(
        context: Context,
        url: String,
        userAgent: String?,
        contentDisposition: String?,
        mimetype: String?
    ) {
        try {
            // Suggest clean filename based on URL and content headers
            val filename = URLUtil.guessFileName(url, contentDisposition, mimetype).let { name ->
                if (name.endsWith(".bin") && mimetype?.contains("pdf", ignoreCase = true) == true) {
                    name.replace(".bin", ".pdf")
                } else if (!name.contains(".")) {
                    "Wink_Invoice_${System.currentTimeMillis()}.pdf"
                } else {
                    name
                }
            }

            val request = DownloadManager.Request(Uri.parse(url)).apply {
                if (!userAgent.isNullOrBlank()) {
                    addRequestHeader("User-Agent", userAgent)
                }
                setTitle(filename)
                setDescription("WINK NETWORK ISP — রসিদ ও ইনভয়েস ডাউনলোড")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationInExternalPublicDir(Environment.DIRECTORY_DOWNLOADS, filename)
                setAllowedOverMetered(true)
                setAllowedOverRoaming(true)
            }

            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            downloadManager.enqueue(request)

            Toast.makeText(
                context,
                context.getString(R.string.download_started),
                Toast.LENGTH_SHORT
            ).show()
        } catch (e: Exception) {
            Toast.makeText(
                context,
                "${context.getString(R.string.download_failed)}: ${e.localizedMessage ?: "ত্রুটি"}",
                Toast.LENGTH_LONG
            ).show()
        }
    }
}
