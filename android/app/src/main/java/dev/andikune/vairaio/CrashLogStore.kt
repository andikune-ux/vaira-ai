package dev.andikune.vairaio

import android.content.Context
import android.os.Build
import java.io.PrintWriter
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object CrashLogStore {
  private const val PREFS = "vaira_native_crash_log"
  private const val KEY_PENDING = "pending_crash"

  fun install(context: Context) {
    val previous = Thread.getDefaultUncaughtExceptionHandler()
    if (previous !is VairaUncaughtExceptionHandler) {
      Thread.setDefaultUncaughtExceptionHandler(VairaUncaughtExceptionHandler(context.applicationContext, previous))
    }
  }

  fun read(context: Context): String? =
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY_PENDING, null)

  fun clear(context: Context) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().remove(KEY_PENDING).commit()
  }

  private fun save(context: Context, thread: Thread, throwable: Throwable) {
    val stack = StringWriter().also { throwable.printStackTrace(PrintWriter(it)) }.toString()
    val info = try { context.packageManager.getPackageInfo(context.packageName, 0) } catch (_: Exception) { null }
    val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) info?.longVersionCode?.toString() else {
      @Suppress("DEPRECATION")
      info?.versionCode?.toString()
    }
    val timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX", Locale.US).format(Date())
    val report = buildString {
      appendLine("VAIRA AI — Native Android Crash")
      appendLine("Waktu: $timestamp")
      appendLine("Perangkat: ${Build.MANUFACTURER} ${Build.MODEL}")
      appendLine("Android: ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
      appendLine("Versi aplikasi: ${info?.versionName ?: "unknown"} (${versionCode ?: "unknown"})")
      appendLine("Thread: ${thread.name}")
      appendLine()
      appendLine("Stack trace:")
      append(stack)
    }
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY_PENDING, report).commit()
  }

  private class VairaUncaughtExceptionHandler(
    private val context: Context,
    private val previous: Thread.UncaughtExceptionHandler?
  ) : Thread.UncaughtExceptionHandler {
    override fun uncaughtException(thread: Thread, throwable: Throwable) {
      try { save(context, thread, throwable) } catch (_: Throwable) { }
      if (previous != null && previous !== this) previous.uncaughtException(thread, throwable)
      else {
        android.os.Process.killProcess(android.os.Process.myPid())
        kotlin.system.exitProcess(10)
      }
    }
  }
}
