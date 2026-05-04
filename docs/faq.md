# FAQ

## Is this official?

No. This is an unofficial open-source project and is not affiliated with Garmin.

## Why not use the official Garmin Health API?

Garmin Health API access is partner-approved and oriented toward business/developer programs. This MCP is for personal local Garmin Connect access.

## Does it store my Garmin password?

No. The auth helper prompts locally and stores Garmin Connect tokens, not your password.

## What data can agents read?

Profile, devices, daily movement, sleep, heart rate, HRV, stress, Body Battery, training readiness/status, respiration, SpO2, activities, weight and hydration when Garmin Connect has that data and the device/account supports it.

## Does it fetch raw sensor data?

No unrestricted raw accelerometer/gyroscope telemetry. It reads processed Garmin Connect data and supported activity detail payloads.

## Can Garmin break this?

Yes. Personal Garmin Connect mode is unofficial and can break if Garmin changes private auth or endpoints. Open an issue with sanitized error output if that happens.
