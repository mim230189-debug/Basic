package bd.winknetwork.app

/**
 * Global configuration constants for WINK NETWORK ISP Android Application.
 */
object Constants {
    /**
     * Primary ISP Web Portal URL.
     * Deployed live Cloud Run endpoint from Google AI Studio.
     */
    const val LIVE_PORTAL_URL: String = "https://ais-pre-bsfdfp4dyahhgoweztv463-276943874327.asia-northeast1.run.app"

    /**
     * Optional custom domain URL for production ISP domain.
     * If configured, users can point to their custom domain (e.g., https://billing.winkisp.com).
     */
    const val CUSTOM_DOMAIN_URL: String = "https://billing.winkisp.com"

    /**
     * Default loaded URL at runtime.
     * Defaults to the live verified web application URL.
     */
    val DEFAULT_URL: String = LIVE_PORTAL_URL

    /**
     * 24/7 ISP Customer Support Hotline for one-touch dialing.
     */
    const val SUPPORT_PHONE: String = "+8809600998877"
    const val SUPPORT_PHONE_DISPLAY: String = "+880 9600-998877"

    /**
     * Official support email.
     */
    const val SUPPORT_EMAIL: String = "support@winkisp.com"

    /**
     * Official application display name.
     */
    const val APP_NAME: String = "WINK NETWORK ISP"
    const val APP_TAGLINE: String = "প্রোডাকশন আইএসপি বিলিং ও ম্যানেজমেন্ট সিস্টেম"
}
