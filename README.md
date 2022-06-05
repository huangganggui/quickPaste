# quickPaste
Designed to quickly operations like paste among mac/win/Linux. It is supported to share your clipboard among PCs

# Usage

If you encounter errors installing nodegui, please check [nodegui FAQs](https://docs.nodegui.org/docs/faq#why-does-installation-fail-at-minimal-qt-setup).

## Choose One of PCs as server
```
npm install
npm start
```
## Choose One of PCs as client
```
npm install
npm start --ip xxx.xxx.xxx.xxx # ip will log on server
```

# TODO list
* ~~support more clients (ust one now)~~
* support images (just string now)
* support files/folders paste (just string now)
* ~~support UI for config server or client~~
* create installer for windows/mac/linux
* support mouse and keyboard share

---
# For developers
## build the apps
* Step 1: (Run this command only once)
```
npx nodegui-packer --init quickPaste
```
* Step 2: (Run this command every time you want to build a new distributable)
```
npm run build
npx nodegui-packer --pack ./dist
```