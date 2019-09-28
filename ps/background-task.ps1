# https://qiita.com/magiclib/items/cc2de9169c781642e52d
# �قڂ��̂܂ܗ��p

Add-Type -AssemblyName System.Windows.Forms

function startBackgroundTask {
    param(
        [parameter(mandatory)][int32]$Interval,
        [parameter(mandatory)][string]$Name,
        [parameter(mandatory)][hashtable]$Callbacks
    )
    
    # ���d�N���`�F�b�N
    $mutex = New-Object System.Threading.Mutex($false, $Name)
    if ($mutex.WaitOne(0, $false)){
        #----------------------------------------------------------------------
        # Form�\�z
        #----------------------------------------------------------------------
        # �^�X�N�o�[��\��
        $windowcode = '[DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);'
        $asyncwindow = Add-Type -MemberDefinition $windowcode -name Win32ShowWindowAsync -namespace Win32Functions -PassThru
        $null = $asyncwindow::ShowWindowAsync((Get-Process -PID $pid).MainWindowHandle, 0)

        $application_context = New-Object System.Windows.Forms.ApplicationContext
        $timer = New-Object Windows.Forms.Timer
        $path = Get-Process -id $pid | Select-Object -ExpandProperty Path # icon�p
        $icon = [System.Drawing.Icon]::ExtractAssociatedIcon($path)

        # �^�X�N�g���C�A�C�R��
        $notify_icon = New-Object System.Windows.Forms.NotifyIcon
        $notify_icon.Icon = $icon
        $notify_icon.Visible = $true

        # ���j���[
        $menu_item_exit = New-Object System.Windows.Forms.MenuItem
        $menu_item_exit.Text = "�I��"
        $notify_icon.ContextMenu = New-Object System.Windows.Forms.ContextMenu
        $notify_icon.contextMenu.MenuItems.AddRange( $menu_item_exit )

        # Exit���j���[�N���b�N���̃C�x���g
        $menu_item_exit.add_Click({
            $application_context.ExitThread()
        })

        # �^�C�}�[�C�x���g.
        $timer.Enabled = $true
        $timer.Add_Tick({
            $timer.Stop()

            try{
                $Callbacks[ 'OnTimeout' ].Invoke( $notify_icon );
            } catch {
                # Catch�ł��Ȃ���O������ΏI������B
                Write-Host '[error] Unhandled exception. Exit.'
                Write-Host $_
                
                # �ʒm��\��
                $notify_icon.BalloonTipIcon = 'Error'
                $notify_icon.BalloonTipTitle = 'Outlook Schedule Uploader'
                $notify_icon.BalloonTipText = '��O�����̂��ߏI���B'
                $application_context.ExitThread()
            }

            # �C���^�[�o�����Đݒ肵�ă^�C�}�[�ĊJ
            $timer.Interval = $Interval
            $timer.Start()
        })
        
        #----------------------------------------------------------------------
        # �N��
        #----------------------------------------------------------------------
        try {
            $Callbacks[ 'OnStart' ].Invoke( $notify_icon );
        } catch {
            Write-Host "[error] �J�n���������s�̂��ߏI���B"
            Write-Host $_
            exit
        }

        $timer.Interval = 1
        $timer.Start()
        [void][System.Windows.Forms.Application]::Run( $application_context )
        
        #----------------------------------------------------------------------
        # ��~
        #----------------------------------------------------------------------
        # ���������I����̃R�[���o�b�N
        $Callbacks[ 'OnStop' ].Invoke( $notify_icon );


        $timer.Stop()
        $notify_icon.Visible = $false
        $mutex.ReleaseMutex()
    } else {
        Write-Host '[info] �N���ς݂̂��ߏI���B'
    }
    $mutex.Close()
    
}
