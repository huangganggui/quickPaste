; Script generated by the HM NIS Edit Script Wizard.

; HM NIS Edit Wizard helper defines
!define PRODUCT_NAME "quickPaste"
!define PRODUCT_VERSION "0.0.0"
!define PRODUCT_PUBLISHER "huangganggui"
!define PRODUCT_WEB_SITE "github.com"
!define PRODUCT_DIR_REGKEY "Software\Microsoft\Windows\CurrentVersion\App Paths\qode.exe"
!define PRODUCT_UNINST_KEY "Software\Microsoft\Windows\CurrentVersion\Uninstall\${PRODUCT_NAME}"
!define PRODUCT_UNINST_ROOT_KEY "HKLM"

; MUI 1.67 compatible ------
!include "MUI.nsh"

; MUI Settings
!define MUI_ABORTWARNING
!define MUI_ICON "${NSISDIR}\Contrib\Graphics\Icons\modern-install.ico"
!define MUI_UNICON "${NSISDIR}\Contrib\Graphics\Icons\modern-uninstall.ico"

; Welcome page
!insertmacro MUI_PAGE_WELCOME
; License page
!insertmacro MUI_PAGE_LICENSE "C:\Users\Administrator\Desktop\�½��ı��ĵ�.txt"
; Directory page
!insertmacro MUI_PAGE_DIRECTORY
; Instfiles page
!insertmacro MUI_PAGE_INSTFILES
; Finish page
!define MUI_FINISHPAGE_RUN "$INSTDIR\qode.exe"
!insertmacro MUI_PAGE_FINISH

; Uninstaller pages
!insertmacro MUI_UNPAGE_INSTFILES

; Language files
!insertmacro MUI_LANGUAGE "English"

; MUI end ------

Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile "Setup.exe"
InstallDir "$PROGRAMFILES\quickPaste"
InstallDirRegKey HKLM "${PRODUCT_DIR_REGKEY}" ""
ShowInstDetails show
ShowUnInstDetails show

Section "MainSection" SEC01
  SetOutPath "$INSTDIR"
  SetOverwrite try
  File "..\deploy\win32\build\quickPaste\D3Dcompiler_47.dll"
  SetOutPath "$INSTDIR\dist"
  File "..\deploy\win32\build\quickPaste\dist\70e21542b14f33289c01b4f2a29cd071.svg"
  File "..\deploy\win32\build\quickPaste\dist\index.js"
  File "..\deploy\win32\build\quickPaste\dist\nodegui_core-b048b6e7ae4f773d92c2402d1a8d36da.node"
  SetOutPath "$INSTDIR\iconengines"
  File "..\deploy\win32\build\quickPaste\iconengines\qsvgicon.dll"
  SetOutPath "$INSTDIR\imageformats"
  File "..\deploy\win32\build\quickPaste\imageformats\qgif.dll"
  File "..\deploy\win32\build\quickPaste\imageformats\qico.dll"
  File "..\deploy\win32\build\quickPaste\imageformats\qjpeg.dll"
  File "..\deploy\win32\build\quickPaste\imageformats\qsvg.dll"
  SetOutPath "$INSTDIR"
  File "..\deploy\win32\build\quickPaste\libEGL.dll"
  File "..\deploy\win32\build\quickPaste\libGLESV2.dll"
  SetOutPath "$INSTDIR\platforms"
  File "..\deploy\win32\build\quickPaste\platforms\.gitkeep"
  File "..\deploy\win32\build\quickPaste\platforms\qwindows.dll"
  SetOutPath "$INSTDIR"
  File "..\deploy\win32\build\quickPaste\qode.exe"
  CreateDirectory "$SMPROGRAMS\quickPaste"
  CreateShortCut "$SMPROGRAMS\quickPaste\quickPaste.lnk" "$INSTDIR\qode.exe"
  CreateShortCut "$DESKTOP\quickPaste.lnk" "$INSTDIR\qode.exe"
  File "..\deploy\win32\build\quickPaste\qode.json"
  File "..\deploy\win32\build\quickPaste\Qt5Core.dll"
  File "..\deploy\win32\build\quickPaste\Qt5Gui.dll"
  File "..\deploy\win32\build\quickPaste\Qt5Svg.dll"
  File "..\deploy\win32\build\quickPaste\Qt5Widgets.dll"
  SetOutPath "$INSTDIR\styles"
  File "..\deploy\win32\build\quickPaste\styles\.gitkeep"
  File "..\deploy\win32\build\quickPaste\styles\qwindowsvistastyle.dll"
SectionEnd

Section -AdditionalIcons
  SetOutPath $INSTDIR
  WriteIniStr "$INSTDIR\${PRODUCT_NAME}.url" "InternetShortcut" "URL" "${PRODUCT_WEB_SITE}"
  CreateShortCut "$SMPROGRAMS\quickPaste\Website.lnk" "$INSTDIR\${PRODUCT_NAME}.url"
  CreateShortCut "$SMPROGRAMS\quickPaste\Uninstall.lnk" "$INSTDIR\uninst.exe"
SectionEnd

Section -Post
  WriteUninstaller "$INSTDIR\uninst.exe"
  WriteRegStr HKLM "${PRODUCT_DIR_REGKEY}" "" "$INSTDIR\qode.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayName" "$(^Name)"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "UninstallString" "$INSTDIR\uninst.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayIcon" "$INSTDIR\qode.exe"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "DisplayVersion" "${PRODUCT_VERSION}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "URLInfoAbout" "${PRODUCT_WEB_SITE}"
  WriteRegStr ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}" "Publisher" "${PRODUCT_PUBLISHER}"
SectionEnd


Function un.onUninstSuccess
  HideWindow
  MessageBox MB_ICONINFORMATION|MB_OK "$(^Name) �ѳɹ��ش���ļ�����Ƴ���"
FunctionEnd

Function un.onInit
  MessageBox MB_ICONQUESTION|MB_YESNO|MB_DEFBUTTON2 "��ȷʵҪ��ȫ�Ƴ� $(^Name) ���估���е������" IDYES +2
  Abort
FunctionEnd

Section Uninstall
  Delete "$INSTDIR\${PRODUCT_NAME}.url"
  Delete "$INSTDIR\uninst.exe"
  Delete "$INSTDIR\styles\qwindowsvistastyle.dll"
  Delete "$INSTDIR\styles\.gitkeep"
  Delete "$INSTDIR\Qt5Widgets.dll"
  Delete "$INSTDIR\Qt5Svg.dll"
  Delete "$INSTDIR\Qt5Gui.dll"
  Delete "$INSTDIR\Qt5Core.dll"
  Delete "$INSTDIR\qode.json"
  Delete "$INSTDIR\qode.exe"
  Delete "$INSTDIR\platforms\qwindows.dll"
  Delete "$INSTDIR\platforms\.gitkeep"
  Delete "$INSTDIR\libGLESV2.dll"
  Delete "$INSTDIR\libEGL.dll"
  Delete "$INSTDIR\imageformats\qsvg.dll"
  Delete "$INSTDIR\imageformats\qjpeg.dll"
  Delete "$INSTDIR\imageformats\qico.dll"
  Delete "$INSTDIR\imageformats\qgif.dll"
  Delete "$INSTDIR\iconengines\qsvgicon.dll"
  Delete "$INSTDIR\dist\nodegui_core-b048b6e7ae4f773d92c2402d1a8d36da.node"
  Delete "$INSTDIR\dist\index.js"
  Delete "$INSTDIR\dist\70e21542b14f33289c01b4f2a29cd071.svg"
  Delete "$INSTDIR\D3Dcompiler_47.dll"

  Delete "$SMPROGRAMS\quickPaste\Uninstall.lnk"
  Delete "$SMPROGRAMS\quickPaste\Website.lnk"
  Delete "$DESKTOP\quickPaste.lnk"
  Delete "$SMPROGRAMS\quickPaste\quickPaste.lnk"

  RMDir "$SMPROGRAMS\quickPaste"
  RMDir "$INSTDIR\styles"
  RMDir "$INSTDIR\platforms"
  RMDir "$INSTDIR\imageformats"
  RMDir "$INSTDIR\iconengines"
  RMDir "$INSTDIR\dist"
  RMDir "$INSTDIR"

  DeleteRegKey ${PRODUCT_UNINST_ROOT_KEY} "${PRODUCT_UNINST_KEY}"
  DeleteRegKey HKLM "${PRODUCT_DIR_REGKEY}"
  SetAutoClose true
SectionEnd