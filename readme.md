# Safari Web Extension Publisher

This module uses Apple's `safari-web-extension-converter` to convert a Web Extension (i.e. Chrome Extension) to a Safari Web Extension, and uploads the native bundle to the Apple App Store using Fastlane. Deployment is available for both iOS and macOS platforms. Runs on both macOS and GitHub-hosted macOS runners. This is the Safari implementation for [Plasmo Browser Platform Publisher](https://github.com/PlasmoHQ/bpp).

Feature includes:
- TypeScript API, with type exports
- Pure ECMAScript module
- Frozen dependencies, updated via renovatebot
- Support for GitHub-hosted macOS runners

Limitations: 
- Only supports Manifest V2 extensions (for now)
- This is beta software that may require handholding and knowledge of Xcode and Fastlane

## Prerequisites (macOS Big Sur 11.3+)
- Xcode (versions 13.2.1 or newer) ```xcode-select -s /Applications/Xcode_13.2.app```
- Xcode Command Line Tools ```xcode-select --install```
- Ruby (versions 2.5 or newer) ```brew install ruby```
- Bundler ```gem install bundler```

## Usage
- Create cert storage with Fastlane Match (reference [CodeSigning.guide](https://codesigning.guide/)) from any Mac; you won't need to set this up more than once
- Create appIds (bundle identifiers) in App Store Connect manually or with Fastlane Produce
    - By default, extension bundle ids will be the same `bundleId` with `.extension` appended
    - Developers can optionally create their own extension bundle id and provide it with the `extensionBundleId` parameter
    - For [Fastlane Produce](https://docs.fastlane.tools/actions/produce/#features:~:text=in%20the%20Keychain-,Usage,-Creating%20a%20new), install Fastlane to your machine, run `fastlane produce`, and follow the prompts to create a new App through App Store Connect
- Integrate into your GitHub Actions with [Plasmo BPP](https://github.com/PlasmoHQ/bpp)

## After App Store delivery
- Create App Store page metadata
- Manually submit the build for App Review

# Options

## App/Bundle Options
| key | required | description |
| ----------- | ----------- | ----------- |
| bundleId | true | i.e. com.plasmo.mock |
| extensionBundleId | false | i.e. com.plasmo.mock.extension |
| appName | true | i.e. Plasmo Mock |
| appCategory | true | last component of [LSApplicationCategoryType](https://developer.apple.com/documentation/bundleresources/information_property_list/lsapplicationcategorytype) (i.e. business)|
| platforms | false | defaults to iOS and macOS|
| buildNumber | false | defaults to GITHUB_RUN_NUMBER |

## Code Signing Identity
Read about [Fastlane Appfile](https://docs.fastlane.tools/advanced/Appfile/) options
| key | description |
| ----------- | ----------- |
| appleId | Your Apple email address |
| appleDevPortalId | Apple Developer Account email address |
| teamName | i.e. Plasmo Corp. |
| teamId | i.e. Q2CBPJ58CA |
| itunesConnectId | App Store Connect Account email address |
| itcTeamName | i.e. "Company Name" for Apple IDs in multiple teams |
| itcTeamId | i.e. "18742801" for Apple IDs in multiple teams |

## Code Signing Options
If you want to use custom provisioning profiles that weren't generated in the pattern of Fastlane Match provisioning profiles
| key | required | description |
| ----------- | ----------- | ----------- |
| provisioningProfiles | false | array of [ProvisioningProfiles](https://github.com/DanielSinclair/safari-webstore-upload/blob/0681fa661b0386e93f40c7bc54344c76920a64b3/src/xcode/common/provisioningProfile.ts#L12) |

## App Store Connect API Key
Read about the [App Store Connect API](https://docs.fastlane.tools/app-store-connect-api/)
| key | required | description |
| ----------- | ----------- | ----------- |
| keyId | true | i.e. "D383SF739" |
| key | true | i.e. "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHknlhdlYdLu\n-----END PRIVATE KEY-----"|
| issuerId | true | i.e. "6053b7fe-68a8-4acb-89be-165aa6465141" |
| duration | false | optional (maximum 1200) | 

## Fastlane Match Options
Read about [Fastlane Match](https://docs.fastlane.tools/actions/match/#match:~:text=alias%20for%20%22sync_code_signing%22-,Parameters,-Key) options
| key | description |
| ----------- | ----------- |
| matchPassword | shared storage encryption password |
| matchStorageMode | defaults to git |
| matchGitUrl | for git |
| matchGitBranch | for git |
| matchGitBasicAuthorization | for git |
| matchGitBearerAuthorization | for git |
| matchGitPrivateKey | for git |
| matchGoogleCloudBucketName | for Google Cloud |
| matchGoogleCloudKeysFile | for Google Cloud |
| matchGoogleCloudProjectId | for Google Cloud |
| matchS3Region | for S3 |
| matchS3AccessKey | for S3 |
| matchS3SecretAccessKey | for S3 |
| matchS3Bucket | for S3 |

## Debugging Options
| key | description |
| ----------- | ----------- |
| workspace | non-tmp static directory to generate workspace to (for file system debugging or project exports) |
| verbose | toggle more detailed logs |

## GitHub Action Workflow
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
      - name: Safari Webstore Upload via Browser Platform Publish
        uses: PlasmoHQ/bpp@v2
        with:
          keys: ${{ secrets.BPP_KEYS }}
```


## Node.js API

```ts
import { SafariPublisher } from "@PlasmoHQ/safari-publisher"

const client = new SafariPublisher({
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
