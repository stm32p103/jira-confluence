# https://qiita.com/magiclib/items/cc2de9169c781642e52d
# ほぼそのまま利用

Add-Type -AssemblyName System.Windows.Forms

function startBackgroundTask {
    param(
        [parameter(mandatory)][int32]$Interval,
        [parameter(mandatory)][string]$Name,
        [parameter(mandatory)][hashtable]$Callbacks
    )
    # 起動
    $Callbacks[ 'OnStarted' ].Invoke();
    
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

        # アイコンクリック時のイベント
        $notify_icon.add_Click({
            if ($_.Button -eq [Windows.Forms.MouseButtons]::Left) {
                # タイマーで実装されているイベントを即時実行する
                $timer.Stop()
                $timer.Interval = 1
                $timer.Start()
            }
        })

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
                $Callbacks[ 'OnProgress' ].Invoke( $notify_icon );
            } catch {
                # Catch去れない例外があれば終了する。
                Write-Host '[error] Unhandled exception. Exit.'
                Write-Host $_
                $application_context.ExitThread()
            }

            # インターバルを再設定してタイマー再開
            $timer.Interval = $Interval
            $timer.Start()
        })
        
        #----------------------------------------------------------------------
        # 起動
        #----------------------------------------------------------------------
        $timer.Interval = 1
        $timer.Start()
        [void][System.Windows.Forms.Application]::Run( $application_context )
        
        #----------------------------------------------------------------------
        # 停止
        #----------------------------------------------------------------------
        $timer.Stop()
        $notify_icon.Visible = $false
        $mutex.ReleaseMutex()
    }
    $mutex.Close()
    
    #----------------------------------------------------------------------
    # 終了
    #----------------------------------------------------------------------
    # 周期処理終了後のコールバック
    $Callbacks[ 'OnFinished' ].Invoke();
}
