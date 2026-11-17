using System;
using System.Drawing;
using System.IO;
using System.Reflection;
using System.Windows.Forms;
using Microsoft.Win32;

namespace XtremeAI
{
    public class SetupForm : Form
    {
        private ProgressBar progressBar;
        private Label lblStatus;
        private Label lblTitle;
        private Label lblSubTitle;
        private CheckBox chkDesktop;
        private CheckBox chkStartMenu;
        private CheckBox chkLaunch;
        private Button btnAction;
        private bool isInstalled = false;
        private string installDir;

        public SetupForm()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "XTREME AI Setup";
            this.Width = 480;
            this.Height = 360;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.FromArgb(19, 19, 20);
            this.ForeColor = Color.FromArgb(227, 227, 227);
            this.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);

            installDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "XTREME AI");

            // Header Panel
            Panel headerPanel = new Panel();
            headerPanel.Dock = DockStyle.Top;
            headerPanel.Height = 85;
            headerPanel.BackColor = Color.FromArgb(28, 29, 30);
            this.Controls.Add(headerPanel);

            lblTitle = new Label();
            lblTitle.Text = "XTREME AI";
            lblTitle.Font = new Font("Segoe UI", 18f, FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(0, 240, 255);
            lblTitle.Location = new Point(24, 16);
            lblTitle.AutoSize = true;
            headerPanel.Controls.Add(lblTitle);

            lblSubTitle = new Label();
            lblSubTitle.Text = "Desktop Application Installer for Windows (Laptop & PC)";
            lblSubTitle.Font = new Font("Segoe UI", 9.5f, FontStyle.Regular);
            lblSubTitle.ForeColor = Color.FromArgb(142, 145, 143);
            lblSubTitle.Location = new Point(26, 50);
            lblSubTitle.AutoSize = true;
            headerPanel.Controls.Add(lblSubTitle);

            // Status Label
            lblStatus = new Label();
            lblStatus.Text = "Ready to install XTREME AI onto your computer.";
            lblStatus.Location = new Point(24, 105);
            lblStatus.AutoSize = true;
            lblStatus.ForeColor = Color.FromArgb(196, 199, 197);
            this.Controls.Add(lblStatus);

            // Progress Bar
            progressBar = new ProgressBar();
            progressBar.Location = new Point(26, 135);
            progressBar.Width = 412;
            progressBar.Height = 18;
            progressBar.Minimum = 0;
            progressBar.Maximum = 100;
            progressBar.Value = 0;
            this.Controls.Add(progressBar);

            // Checkboxes
            chkDesktop = new CheckBox();
            chkDesktop.Text = "Create Desktop shortcut";
            chkDesktop.Checked = true;
            chkDesktop.Location = new Point(28, 175);
            chkDesktop.AutoSize = true;
            chkDesktop.ForeColor = Color.FromArgb(227, 227, 227);
            this.Controls.Add(chkDesktop);

            chkStartMenu = new CheckBox();
            chkStartMenu.Text = "Create Start Menu shortcut";
            chkStartMenu.Checked = true;
            chkStartMenu.Location = new Point(28, 205);
            chkStartMenu.AutoSize = true;
            chkStartMenu.ForeColor = Color.FromArgb(227, 227, 227);
            this.Controls.Add(chkStartMenu);

            chkLaunch = new CheckBox();
            chkLaunch.Text = "Launch XTREME AI after setup finishes";
            chkLaunch.Checked = true;
            chkLaunch.Location = new Point(28, 235);
            chkLaunch.AutoSize = true;
            chkLaunch.ForeColor = Color.FromArgb(227, 227, 227);
            this.Controls.Add(chkLaunch);

            // Action Button
            btnAction = new Button();
            btnAction.Text = "Install XTREME AI";
            btnAction.Location = new Point(285, 275);
            btnAction.Width = 155;
            btnAction.Height = 36;
            btnAction.BackColor = Color.FromArgb(0, 240, 255);
            btnAction.ForeColor = Color.FromArgb(10, 10, 10);
            btnAction.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            btnAction.FlatStyle = FlatStyle.Flat;
            btnAction.FlatAppearance.BorderSize = 0;
            btnAction.Cursor = Cursors.Hand;
            btnAction.Click += BtnAction_Click;
            this.Controls.Add(btnAction);
        }

        private void BtnAction_Click(object sender, EventArgs e)
        {
            if (isInstalled)
            {
                if (chkLaunch.Checked)
                {
                    string targetExe = Path.Combine(installDir, "XTREME AI.exe");
                    if (File.Exists(targetExe))
                    {
                        System.Diagnostics.Process.Start(targetExe);
                    }
                }
                this.Close();
                return;
            }

            btnAction.Enabled = false;
            PerformInstallation();
        }

        private void PerformInstallation()
        {
            try
            {
                lblStatus.Text = "Creating installation directory...";
                progressBar.Value = 20;
                Application.DoEvents();

                if (!Directory.Exists(installDir))
                {
                    Directory.CreateDirectory(installDir);
                }

                lblStatus.Text = "Extracting application components...";
                progressBar.Value = 40;
                Application.DoEvents();

                Assembly currentAssembly = Assembly.GetExecutingAssembly();

                // 1. Extract XTREME AI.exe
                string destExe = Path.Combine(installDir, "XTREME AI.exe");
                ExtractResource(currentAssembly, "AppLauncher", destExe);

                // 2. Extract icon.ico
                string destIcon = Path.Combine(installDir, "icon.ico");
                ExtractResource(currentAssembly, "AppIcon", destIcon);

                // 3. Extract uninstall.exe
                string destUninstall = Path.Combine(installDir, "uninstall.exe");
                ExtractResource(currentAssembly, "AppUninstaller", destUninstall);

                progressBar.Value = 70;
                Application.DoEvents();

                // 4. Create Desktop Shortcut
                if (chkDesktop.Checked)
                {
                    lblStatus.Text = "Creating Desktop shortcut...";
                    string desktopPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "XTREME AI.lnk");
                    CreateShortcut(desktopPath, destExe, destIcon);
                }

                // 5. Create Start Menu Shortcut
                if (chkStartMenu.Checked)
                {
                    lblStatus.Text = "Creating Start Menu shortcut...";
                    string startMenuDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                    if (!Directory.Exists(startMenuDir)) Directory.CreateDirectory(startMenuDir);
                    string startMenuPath = Path.Combine(startMenuDir, "XTREME AI.lnk");
                    CreateShortcut(startMenuPath, destExe, destIcon);
                }

                // 6. Register in Windows Add/Remove Programs
                lblStatus.Text = "Registering application in Windows...";
                progressBar.Value = 90;
                Application.DoEvents();

                try
                {
                    using (RegistryKey key = Registry.CurrentUser.CreateSubKey(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\XTREME AI"))
                    {
                        if (key != null)
                        {
                            key.SetValue("DisplayName", "XTREME AI");
                            key.SetValue("DisplayVersion", "1.0.0");
                            key.SetValue("Publisher", "XTREME AI");
                            key.SetValue("DisplayIcon", destIcon);
                            key.SetValue("InstallLocation", installDir);
                            key.SetValue("UninstallString", "\"" + destUninstall + "\"");
                            key.SetValue("EstimatedSize", 1024, RegistryValueKind.DWord);
                        }
                    }
                }
                catch { }

                progressBar.Value = 100;
                lblStatus.Text = "Installation complete! XTREME AI is now installed.";
                lblStatus.ForeColor = Color.FromArgb(0, 240, 255);
                btnAction.Text = "Finish & Launch";
                btnAction.Enabled = true;
                isInstalled = true;
            }
            catch (Exception ex)
            {
                MessageBox.Show("Installation error: " + ex.Message, "Setup Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                btnAction.Enabled = true;
                lblStatus.Text = "Installation failed.";
            }
        }

        private void ExtractResource(Assembly assembly, string resourceName, string outputPath)
        {
            using (Stream stream = assembly.GetManifestResourceStream(resourceName))
            {
                if (stream == null)
                {
                    throw new Exception("Resource not found: " + resourceName);
                }
                using (FileStream fs = new FileStream(outputPath, FileMode.Create, FileAccess.Write))
                {
                    byte[] buffer = new byte[81920];
                    int read;
                    while ((read = stream.Read(buffer, 0, buffer.Length)) > 0)
                    {
                        fs.Write(buffer, 0, read);
                    }
                }
            }
        }

        private void CreateShortcut(string shortcutPath, string targetExePath, string iconPath)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                if (shellType != null)
                {
                    dynamic shell = Activator.CreateInstance(shellType);
                    var shortcut = shell.CreateShortcut(shortcutPath);
                    shortcut.TargetPath = targetExePath;
                    shortcut.WorkingDirectory = Path.GetDirectoryName(targetExePath);
                    shortcut.IconLocation = iconPath + ",0";
                    shortcut.Description = "XTREME AI - Advanced Multimodal Intelligence";
                    shortcut.Save();
                }
            }
            catch { }
        }

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);
            Application.Run(new SetupForm());
        }
    }
}
