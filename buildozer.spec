[app]
title = ZIG HOST CHECKER
package.name = zighostchecker
package.domain = org.zigalyxr
source.dir = .
source.include_exts = py,kv,png,jpg,json,txt
version = 1.0
requirements = python3,kivy
orientation = portrait
fullscreen = 0
icon.filename = assets/zig_host_checker_logo.png
android.permissions = INTERNET,ACCESS_NETWORK_STATE
android.api = 35
android.minapi = 23
android.archs = arm64-v8a, armeabi-v7a
android.accept_sdk_license = True

[buildozer]
log_level = 2
warn_on_root = 1
