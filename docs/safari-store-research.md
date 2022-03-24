## Plan
- Given the zip, we need to guide user to setup their safari
	- -> future opportunity to do in-server conversion of the extension, an adding:
		- Bundle identifier at the correct place (using simple grep etc)
		- Correct files/stuff according to the PRs
	- -> Is there a way to use the gh actions for fastlane and xcode right in our action?
		- => OR we will have to fork their code to download the tooling
	- Or use https://github.com/actions/toolkit 
		- <- there's a `tool-cache` which allow to download an archive to be used
			- <- suspect other action are using it too
		- Test if we can use exec tool to run the fastlane setup with brew???
	- https://github.com/maxim-lobanov/setup-xcode
		- => Seems like that's not the case. This action simply used to swap xcode version
		- => Maybe we can consume it from github path via package.json
		- => easiest way rn is to simply copy the code over and use it.
```
child.spawnSync("sudo", ["xcode-select", "-s", xcodeVersion.path]);

// set "MD_APPLE_SDK_ROOT" environment variable to specify Xcode for Mono and Xamarin

core.exportVariable("MD_APPLE_SDK_ROOT", xcodeVersion.path);
```

-> Another path is simply running those in providing user a template for safari-deployment
-> setup ruby
-> setup fastlane
-> setup xcode
-> our script runs the rest: safari build, bundle, submit
- The MACOS environment has brew: https://github.com/actions/virtual-environments/blob/main/images/macos/macos-11-Readme.md

---

## Research
- https://docs.github.com/en/actions/deployment/deploying-xcode-applications/installing-an-apple-certificate-on-macos-runners-for-xcode-development
	- Code signing in gh-action
- https://developer.apple.com/documentation/safariservices/safari_web_extensions/distributing_your_safari_web_extension
- [[Safari Publish Step-by-step Guide]]
	- Largely useless
	- These two doesn't have much about the actual release process.
	- Largely relies on XCode bundling
- To convert a chrome extension to XCode:
	- https://developer.apple.com/documentation/safariservices/safari_web_extensions/converting_a_web_extension_for_safari
- https://github.com/refined-github/refined-github
	- => This extension is published on the safari webstore
	- https://github.com/refined-github/refined-github/issues/3686
		- <- there's a branch in here that's using fastlane to bundle the extension???
		- https://github.com/refined-github/refined-github/issues/3686
		- <- lot's of funding on this issue
		- https://github.com/abhijithvijayan/web-extension-starter/issues/49
			- <- seems like a zeitgeist
		- https://github.com/OctoLinker/OctoLinker/pull/1167
			- <- this PR tracks a lot of work on the safari conversion
			- https://github.com/OctoLinker/OctoLinker/pull/1167/files#r551734538
				- LOL...
			- 
		- https://github.com/fregante/GhostText/pull/188/files
			- <- has a script to build the extension?
			- <- seems to be ignoring some fastlane stuff, maybe there's some fastlane stuff
		- https://github.com/maxim-lobanov/setup-xcode
			- <- xcode  
- https://github.com/google/service-worker-detector/blob/main/package.json
	- Has a script for the command below with example usage
	- `xcrun safari-web-extension-converter /path/to/extension`
		- --bundle-identifier
		- --swift
		- --app-name
		- --project-location
	- Do we need to notorize the bundle?
		- https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution/customizing_the_notarization_workflow
	- How to sign the bundle and replicate the submission process for Safari?
	- Can we run this in a github action mac container?
		- https://augmentedcode.io/2021/04/26/running-tests-in-swift-package-with-github-actions/
	- https://bartsolutions.github.io/2020/11/20/safari-extension/
	-  
