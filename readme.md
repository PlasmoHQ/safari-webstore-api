# Apple Safari Web Extension App Store Upload

This module uses Apple's `safari-web-extension-converter` to convert a Web Extension to a Safari Web Extension, and uploads the native bundle to the Apple App Store using Fastlane. Deployment is available for both iOS and macOS platforms. Runs on both macOS and GitHub-hosted macOS runners.

Feature includes:
- TypeScript API, with type exports
- Pure ECMAScript module
- Frozen dependencies, updated via renovatebot
- Support for GitHub-hosted macOS runners

## Prerequisites (macOS Big Sur 11.3+)
- Xcode (versions 13.2.1 or newer) ```xcode-select -s /Applications/Xcode_13.2.app```
- Xcode Command Line Tools ```xcode-select --install```
- Ruby (versions 2.5 or newer) ```brew install ruby```
- Bundler ```gem install bundler```

## Usage
- Create cert storage with Fastlane Match (reference [CodeSigning.guide](https://codesigning.guide/))
- Create appIds (bundle identifiers) in App Store Connect manually or with Fastlane Produce
    - By default, extension bundle ids will be the same `bundleId` with `.extension` appended
    - Developers can optionally create their own extension bundle id and provide it with the `extensionBundleId` parameter

## After App Store delivery
- Create App Store page metadata
- Manually submit the build for App Review

## Fastlane GitHub Action Workflow
```yaml
jobs:
  test:
    runs-on: macos-10.15
    timeout-minutes: 15
    steps:
      - name: Git - Checkout
        uses: actions/checkout@v3.0.0
        with:
          ref: ${{ github.ref }}
      - name: Setup - Xcode
        run: xcode-select -s /Applications/Xcode_13.2.app
      - name: Setup - Ruby and bundler dependencies
        uses: ruby/setup-ruby@v1.99.0
        with:
          bundler-cache: true
      - name: Safari Webstore Upload
        run: this-is-the-command
```

## Node.js API

```ts
import { SafariWebstoreClient } from "@plasmo-corp/swu"

const client = new SafariWebstoreClient({
  "bundleId": "com.plasmo.mock",
  "appName": "Plasmo Mock",
  "appCategory": "developer-tools",
  "platforms": ["ios", "macos"],
  "appleId": "DEVELOPER_APPLE_ID",
  "teamId": "APPLE_DEVELOPER_TEAM_ID",
  "teamName": "Plasmo Corp.",
  "keyId": "APP_STORE_CONNECT_API_KEY_ID",
  "issuerId": "APP_STORE_CONNECT_API_ISSUER_ID",
  "key": "APP_STORE_CONNECT_API_KEY",
  "matchPassword": "YOUR_MATCH_ENCRYPTION_PASSWORD",
  "matchGitUrl": "YOUR_MATCH_REPO"
})


await client.submit({
  filePath: zip
})
```

# Future
### Adopt [XcodeGen](https://github.com/yonaskolb/XcodeGen) to simplify project generation and schema management
We currently manually modify the generated Xcode project to suit our needs, which may be difficult to maintain:
-  Recreate user build schemes; mimicking Xcode's behavior upon project open: [Xcodeproj.recreate_user_schemes](https://github.com/plasmo-foss/fastlane-plugin-safari-web-extension-converter/blob/41bfd5048c0b2c2b5c8c383f7c370f5cd9a7f2f2/lib/fastlane/plugin/safari_web_extension_converter/helper/safari_web_extension_converter_helper.rb#L48)
- Replace pbx bundle identifiers to circumvent generator bug: [Xcodeproj.targets.each](https://github.com/plasmo-foss/fastlane-plugin-safari-web-extension-converter/blob/41bfd5048c0b2c2b5c8c383f7c370f5cd9a7f2f2/lib/fastlane/plugin/safari_web_extension_converter/helper/safari_web_extension_converter_helper.rb#L58)
- Replacing wrong static bundle ids in generated code [text.gsub](https://github.com/plasmo-foss/fastlane-plugin-safari-web-extension-converter/blob/41bfd5048c0b2c2b5c8c383f7c370f5cd9a7f2f2/lib/fastlane/plugin/safari_web_extension_converter/helper/safari_web_extension_converter_helper.rb#L72)
- Generate Xcode Workspace (to allow Fastlane to see subdirectory project with xml FileRefs) [XML generator](https://github.com/DanielSinclair/safari-webstore-upload/blob/a25c6b8a889f3610aef5b4ea8aca3308700d8fdf/src/xcode/index.ts#L35)
- Add LSApplicationCategoryType to Info.plist [xcodeWorkspace.writeKeyToInfoPlists](https://github.com/DanielSinclair/safari-webstore-upload/blob/a25c6b8a889f3610aef5b4ea8aca3308700d8fdf/src/index.ts#L147)
- Update project team with [fastlane run update_project_team](https://github.com/DanielSinclair/safari-webstore-upload/blob/a25c6b8a889f3610aef5b4ea8aca3308700d8fdf/src/fastlane/index.ts#L120)
- Update code signing settings [fastlane run update_code_signing_settings](https://github.com/DanielSinclair/safari-webstore-upload/blob/a25c6b8a889f3610aef5b4ea8aca3308700d8fdf/src/fastlane/index.ts#L89)
- Set/increment build number [fastlane run increment_build_number](https://github.com/DanielSinclair/safari-webstore-upload/blob/a25c6b8a889f3610aef5b4ea8aca3308700d8fdf/src/fastlane/index.ts#L143)


# Acknowledgment
- [fastlane](https://docs.fastlane.tools/)
- [safari-web-extension-converter](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)

# License

[MIT](./license) ⭐ [Plasmo Corp.](https://plasmo.com)
