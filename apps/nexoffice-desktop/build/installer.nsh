; ============================================================
;  NexOffice — language-aware installer customisation
;  (Bahasa Melayu + English, selected via the NSIS language picker)
; ============================================================
!include "MUI2.nsh"
!include "LogicLib.nsh"
!include "nsDialogs.nsh"

!ifndef NEXOFFICE_NSH_INCLUDED
!define NEXOFFICE_NSH_INCLUDED

; ------------------------------------------------------------
;  Install-side pages only (skip during the uninstaller build,
;  where these functions would otherwise be unreferenced).
;  Text is chosen at runtime from $LANGUAGE, so the custom
;  welcome/finish pages follow the language picked in the
;  NSIS language-selection dialog (first screen).
; ------------------------------------------------------------
!ifndef BUILD_UNINSTALLER

Var nxRunCheckbox
Var nxW_Title
Var nxW_Sub
Var nxW_L1
Var nxW_L2
Var nxW_L3
Var nxF_Title
Var nxF_Sub
Var nxF_L1
Var nxF_L2
Var nxF_Run

Function nxLoadLang
  ; Normalise Spanish International (1034) to Spanish (3082) so a single
  ; es_ES branch below handles both LCIDs (LogicLib ElseIf has no || support).
  ${If} $LANGUAGE == 1034
    StrCpy $LANGUAGE 3082
  ${EndIf}
  ${If} $LANGUAGE == 1086        ; ms_MY
    StrCpy $nxW_Title "NexOffice — Selamat Datang"
    StrCpy $nxW_Sub "Wizard Pemasangan"
    StrCpy $nxW_L1 "Wizard ini akan memasang NexOffice (Sistem Pengurusan Pejabat) pada komputer anda."
    StrCpy $nxW_L2 "Ia merangkumi modul Staf, Gaji/Payroll, Cuti, Kehadiran dan Laporan.$\r$\n$\r$\nSila tutup semua aplikasi lain sebelum meneruskan."
    StrCpy $nxW_L3 "Klik 'Seterusnya' untuk meneruskan."
    StrCpy $nxF_Title "Pemasangan Selesai"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "NexOffice telah dipasang dengan jayanya."
    StrCpy $nxF_L2 "Terima kasih kerana memasang NexOffice.$\r$\nAnda boleh memulakan aplikasi melalui ikon di Desktop atau Menu Mula."
    StrCpy $nxF_Run "Jalankan NexOffice sekarang"
  ${ElseIf} $LANGUAGE == 1057    ; id_ID
    StrCpy $nxW_Title "NexOffice — Selamat Datang"
    StrCpy $nxW_Sub "Wizard Pemasangan"
    StrCpy $nxW_L1 "Wizard ini akan memasang NexOffice (Sistem Pengurusan Pejabat) di komputer Anda."
    StrCpy $nxW_L2 "Termasuk modul Staf, Gaji/Payroll, Cuti, Kehadiran dan Laporan.$\r$\n$\r$\nSilakan tutup semua aplikasi lain sebelum melanjutkan."
    StrCpy $nxW_L3 "Klik 'Berikutnya' untuk melanjutkan."
    StrCpy $nxF_Title "Pemasangan Selesai"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "NexOffice berhasil dipasang."
    StrCpy $nxF_L2 "Terima kasih telah memasang NexOffice.$\r$\nAnda dapat memulai aplikasi melalui ikon di Desktop atau Menu Mulai."
    StrCpy $nxF_Run "Jalankan NexOffice sekarang"
  ${ElseIf} $LANGUAGE == 2052    ; zh_CN
    StrCpy $nxW_Title "NexOffice — 欢迎"
    StrCpy $nxW_Sub "安装向导"
    StrCpy $nxW_L1 "此向导将在您的计算机上安装 NexOffice（办公管理系统）。"
    StrCpy $nxW_L2 "包含员工、薪资、休假、考勤和报表模块。$\r$\n$\r$\n请先关闭其他应用程序。"
    StrCpy $nxW_L3 "单击“下一步”继续。"
    StrCpy $nxF_Title "安装完成"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "NexOffice 已成功安装。"
    StrCpy $nxF_L2 "感谢您安装 NexOffice。$\r$\n您可以通过桌面或开始菜单中的图标启动应用。"
    StrCpy $nxF_Run "立即启动 NexOffice"
  ${ElseIf} $LANGUAGE == 3082    ; es_ES (Spanish / SpanishInternational normalised above)
    StrCpy $nxW_Title "NexOffice — Bienvenido"
    StrCpy $nxW_Sub "Asistente de instalación"
    StrCpy $nxW_L1 "Este asistente instalará NexOffice (Sistema de Gestión de Oficina) en su computadora."
    StrCpy $nxW_L2 "Incluye los módulos de Personal, Nómina, Vacaciones, Asistencia e Informes.$\r$\n$\r$\nCierre cualquier otra aplicación antes de continuar."
    StrCpy $nxW_L3 "Haga clic en 'Siguiente' para continuar."
    StrCpy $nxF_Title "Instalación completada"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "NexOffice se ha instalado correctamente."
    StrCpy $nxF_L2 "Gracias por instalar NexOffice.$\r$\nPuede iniciar la aplicación desde el acceso directo del Escritorio o del Menú Inicio."
    StrCpy $nxF_Run "Iniciar NexOffice ahora"
  ${ElseIf} $LANGUAGE == 1041    ; ja_JP
    StrCpy $nxW_Title "NexOffice — ようこそ"
    StrCpy $nxW_Sub "セットアップウィザード"
    StrCpy $nxW_L1 "このウィザードは NexOffice（オフィス管理システム）をコンピューターにインストールします。"
    StrCpy $nxW_L2 "スタッフ、給与、休暇、勤怠、レポートの各モジュールが含まれます。$\r$\n$\r$\n続行する前に他のアプリケーションをすべて閉じてください。"
    StrCpy $nxW_L3 "続行するには「次へ」をクリックしてください。"
    StrCpy $nxF_Title "インストール完了"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "NexOffice が正常にインストールされました。"
    StrCpy $nxF_L2 "NexOffice をインストールしていただきありがとうございます。$\r$\nデスクトップまたはスタートメニューのショートカットから起動できます。"
    StrCpy $nxF_Run "今すぐ NexOffice を起動"
  ${ElseIf} $LANGUAGE == 1025    ; ar_SA (Arabic)
    StrCpy $nxW_Title "NexOffice — مرحباً"
    StrCpy $nxW_Sub "معالج التثبيت"
    StrCpy $nxW_L1 "سيثبّت هذا المعالج NexOffice (نظام إدارة المكاتب) على جهاز الكمبيوتر الخاص بك."
    StrCpy $nxW_L2 "يتضمن وحدات الموظفين والرواتب والإجازات والحضور والتقارير.$\r$\n$\r$\nيرجى إغلاق أي تطبيقات أخرى قبل المتابعة."
    StrCpy $nxW_L3 "انقر فوق 'التالي' للمتابعة."
    StrCpy $nxF_Title "اكتمل التثبيت"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "تم تثبيت NexOffice بنجاح."
    StrCpy $nxF_L2 "شكرًا لتثبيتك NexOffice.$\r$\nيمكنك تشغيل التطبيق من اختصار سطح المكتب أو قائمة ابدأ."
    StrCpy $nxF_Run "تشغيل NexOffice الآن"
  ${ElseIf} $LANGUAGE == 1042    ; ko_KR
    StrCpy $nxW_Title "NexOffice — 환영합니다"
    StrCpy $nxW_Sub "설치 마법사"
    StrCpy $nxW_L1 "이 마법사는 컴퓨터에 NexOffice(사무 관리 시스템)를 설치합니다."
    StrCpy $nxW_L2 "직원, 급여, 휴가, 근태, 보고서 모듈이 포함됩니다.$\r$\n$\r$\n계속하기 전에 다른 응용 프로그램을 모두 닫아 주세요."
    StrCpy $nxW_L3 "계속하려면 '다음'을 클릭하세요."
    StrCpy $nxF_Title "설치 완료"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "NexOffice가 성공적으로 설치되었습니다."
    StrCpy $nxF_L2 "NexOffice를 설치해 주셔서 감사합니다.$\r$\n바탕화면 또는 시작 메뉴의 바로가기에서 앱을 시작할 수 있습니다."
    StrCpy $nxF_Run "지금 NexOffice 실행"
  ${Else}
    StrCpy $nxW_Title "NexOffice — Welcome"
    StrCpy $nxW_Sub "Setup Wizard"
    StrCpy $nxW_L1 "This wizard will install NexOffice (Office Management System) on your computer."
    StrCpy $nxW_L2 "It includes Staff, Payroll, Leave, Attendance and Reports modules.$\r$\n$\r$\nPlease close any other applications before continuing."
    StrCpy $nxW_L3 "Click 'Next' to continue."
    StrCpy $nxF_Title "Installation Complete"
    StrCpy $nxF_Sub "NexOffice"
    StrCpy $nxF_L1 "NexOffice has been installed successfully."
    StrCpy $nxF_L2 "Thank you for installing NexOffice.$\r$\nYou can start the app from the Desktop or Start Menu shortcut."
    StrCpy $nxF_Run "Launch NexOffice now"
  ${EndIf}
FunctionEnd

; ---------- Welcome page (language-aware) ----------
!macro customWelcomePage
  Page custom nxWelcomeCreate nxWelcomeLeave
!macroend

Function nxWelcomeCreate
  Call nxLoadLang
  !insertmacro MUI_HEADER_TEXT "$nxW_Title" "$nxW_Sub"
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0u 6u 100% 26u "$nxW_L1"
  Pop $0
  ${NSD_CreateLabel} 0u 34u 100% 58u "$nxW_L2"
  Pop $0
  ${NSD_CreateLabel} 0u 96u 100% 30u "$nxW_L3"
  Pop $0

  nsDialogs::Show
FunctionEnd

Function nxWelcomeLeave
FunctionEnd

; ---------- Finish page (language-aware) ----------
!macro customFinishPage
  Page custom nxFinishCreate nxFinishLeave
!macroend

Function nxFinishCreate
  Call nxLoadLang
  !insertmacro MUI_HEADER_TEXT "$nxF_Title" "$nxF_Sub"
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}

  ${NSD_CreateLabel} 0u 6u 100% 26u "$nxF_L1"
  Pop $0
  ${NSD_CreateLabel} 0u 34u 100% 44u "$nxF_L2"
  Pop $0
  ${NSD_CreateCheckbox} 0u 86u 100% 14u "$nxF_Run"
  Pop $nxRunCheckbox
  ${NSD_SetState} $nxRunCheckbox ${BST_CHECKED}

  nsDialogs::Show
FunctionEnd

Function nxFinishLeave
  ${NSD_GetState} $nxRunCheckbox $0
  ${If} $0 == ${BST_CHECKED}
    ExecShell "" "$INSTDIR\NexOffice.exe"
  ${EndIf}
FunctionEnd

!endif ; BUILD_UNINSTALLER

; Malay (ms_MY) translations for the NSIS MultiUser plugin install-mode page and
; electron-builder's standard installer messages are supplied by patching NSIS's
; language files / electron-builder's templates: run  `node nsis-ms-patch.js`
; (auto-run via the "postinstall" npm script).

!endif ; NEXOFFICE_NSH_INCLUDED

