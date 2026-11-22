package dev.andikune.vairaio

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NativeCrashLogModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "VairaNativeCrashLog"

  @ReactMethod
  fun getPendingCrash(promise: Promise) {
    try { promise.resolve(CrashLogStore.read(reactApplicationContext)) }
    catch (error: Exception) { promise.reject("CRASH_LOG_READ_FAILED", error) }
  }

  @ReactMethod
  fun clearPendingCrash(promise: Promise) {
    try { CrashLogStore.clear(reactApplicationContext); promise.resolve(true) }
    catch (error: Exception) { promise.reject("CRASH_LOG_CLEAR_FAILED", error) }
  }
}
