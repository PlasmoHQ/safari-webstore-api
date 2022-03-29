# Apple Safari Web Extension App Store Upload

This module uses Apple's `safari-web-extension-converter` to convert an extension to a Safari Web Extension, and uploads the native wrapper bundle to the Apple App Store using Fastlane. Supports macOS and GitHub-hosted macOS runners.

Feature includes:
- TypeScript API, with type exports
- Pure ECMAScript module
- Frozen dependencies, updated via renovatebot
- Support for GitHub-hosted macOS runners

## Prerequisites (macOS Big Sur 11.3+)
- Xcode (versions 13.2.1 or newer) ```xcode-select -s /Applications/Xcode_13.2.app```
- Xcode Command Line Tools ```xcode-select --install```
- Ruby (versions 2.5 or newer)
- Bundler ```gem install bundler```

## Usage
- ```bundle install```
- ```bundle exec fastlane [lane]```

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
      - name: Fastlane Release
        run: bundle exec fastlane release
```

## Node.js API

```ts
import { SafariWebstoreClient } from "@plasmo-corp/swu"

const client = new SafariWebstoreClient({

})


await client.submit({
  filePath: zip
})
```

# Acknowledgment
- [fastlane](https://docs.fastlane.tools/)
- [safari-web-extension-converter](https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari)

# License

[MIT](./license) ⭐ [Plasmo Corp.](https://plasmo.com)
