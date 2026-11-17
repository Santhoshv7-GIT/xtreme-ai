using System;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;

namespace XtremeAI
{
    static class Uninstaller
    {
        [STAThread]
        static void Main()
        {
            DialogResult res = MessageBox.Show(
                "Are you sure you want to uninstall XTREME AI from your computer?",
                "Uninstall XTREME AI",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );

            if (res != DialogResult.Yes) return;

            try
            {
                // Remove Desktop Shortcut
                string desktopShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Desktop), "XTREME AI.lnk");
                if (File.Exists(desktopShortcut)) File.Delete(desktopShortcut);

                // Remove Start Menu Shortcut
                string startMenuShortcut = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs", "XTREME AI.lnk");
                if (File.Exists(startMenuShortcut)) File.Delete(startMenuShortcut);

                // Remove Registry Key
                try
                {
                    Registry.CurrentUser.DeleteSubKeyTree(@"Software\Microsoft\Windows\CurrentVersion\Uninstall\XTREME AI", false);
                }
                catch { }

                MessageBox.Show(
                    "XTREME AI has been successfully uninstalled from your PC.",
                    "Uninstall Complete",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
            catch (Exception ex)
            {
                MessageBox.Show("Error during uninstall: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
