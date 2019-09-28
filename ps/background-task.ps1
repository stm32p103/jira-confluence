# https://qiita.com/magiclib/items/cc2de9169c781642e52d
# ほぼそのまま利用

Add-Type -AssemblyName System.Windows.Forms

function startBackgroundTask {
    param(
        [parameter(mandatory)][int32]$Interval,
        [parameter(mandatory)][string]$Name,
        [parameter(mandatory)][hashtable]$Callbacks
    )
    
    # 多重起動チェック
    $mutex = New-Object System.Threading.Mutex($false, $Name)
    if ($mutex.WaitOne(0, $false)){
        #----------------------------------------------------------------------
        # Form構築
        #----------------------------------------------------------------------
        # タスクバー非表示
        $windowcode = '[DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);'
        $asyncwindow = Add-Type -MemberDefinition $windowcode -name Win32ShowWindowAsync -namespace Win32Functions -PassThru
        $null = $asyncwindow::ShowWindowAsync((Get-Process -PID $pid).MainWindowHandle, 0)

        $application_context = New-Object System.Windows.Forms.ApplicationContext
        $timer = New-Object Windows.Forms.Timer
        $path = Get-Process -id $pid | Select-Object -ExpandProperty Path # icon用
        $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)

        # タスクトレイアイコン
        $notify_icon = New-Object System.Windows.Forms.NotifyIcon
        $notify_icon.Icon = $icon
        $notify_icon.Visible = $true

        # メニュー
        $menu_item_exit = New-Object System.Windows.Forms.MenuItem
        $menu_item_exit.Text = "終了"
        $notify_icon.ContextMenu = New-Object System.Windows.Forms.ContextMenu
        $notify_icon.contextMenu.MenuItems.AddRange( $menu_item_exit )

        # Exitメニュークリック時のイベント
        $menu_item_exit.add_Click({
            $application_context.ExitThread()
        })

        # タイマーイベント.
        $timer.Enabled = $true
        $timer.Add_Tick({
            $timer.Stop()

            try{
                $Callbacks[ 'OnTimeout' ].Invoke( $notify_icon );
            } catch {
                # Catchできない例外があれば終了する。
                Write-Host '[error] Unhandled exception. Exit.'
                Write-Host $_
                
                # 通知を表示
                $notify_icon.BalloonTipIcon = 'Error'
                $notify_icon.BalloonTipTitle = 'Outlook Schedule Uploader'
                $notify_icon.BalloonTipText = '例外発生のため終了。'
                $application_context.ExitThread()
            }

            # インターバルを再設定してタイマー再開
            $timer.Interval = $Interval
            $timer.Start()
        })
        
        #----------------------------------------------------------------------
        # 起動
        #----------------------------------------------------------------------
        try {
            $Callbacks[ 'OnStart' ].Invoke( $notify_icon );
        } catch {
            Write-Host "[error] 開始時処理失敗のため終了。"
            Write-Host $_
            exit
        }

        $timer.Interval = 1
        $timer.Start()
        [void][System.Windows.Forms.Application]::Run( $application_context )
        
        #----------------------------------------------------------------------
        # 停止
        #----------------------------------------------------------------------
        # 周期処理終了後のコールバック
        $Callbacks[ 'OnStop' ].Invoke( $notify_icon );


        $timer.Stop()
        $notify_icon.Visible = $false
        $mutex.ReleaseMutex()
    } else {
        Write-Host '[info] 起動済みのため終了。'
    }
    $mutex.Close()
    
}
