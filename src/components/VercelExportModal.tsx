import React, { useState } from 'react';
import {
  Download,
  FileCode,
  Globe,
  Check,
  Copy,
  FolderArchive,
  Database,
  ExternalLink,
  ShieldCheck,
  Upload,
  GitBranch,
  Terminal,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import JSZip from 'jszip';
import { coupleService } from '../services/coupleService';

interface VercelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  spaceTitle: string;
}

export const VercelExportModal: React.FC<VercelExportModalProps> = ({
  isOpen,
  onClose,
  spaceTitle,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'download' | 'github_guide' | 'git_commands'>('download');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Generate downloadable standalone index.html
  const handleDownloadIndexHtml = () => {
    const htmlContent = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${spaceTitle} - Đếm Ngày Yêu Cặp Đôi</title>
  <meta name="description" content="Ứng dụng đếm ngày yêu thương, lịch thứ hẹn hò, nhắn tin ẩn danh, album ảnh và bản đồ tọa độ." />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-romantic { font-family: 'Dancing Script', cursive; }
  </style>
</head>
<body class="bg-gradient-to-b from-rose-50 via-white to-pink-50 min-h-screen">
  <div id="root" class="max-w-md mx-auto p-4 text-center">
    <div class="mt-8 p-6 bg-white rounded-3xl shadow-xl border border-rose-100">
      <div class="w-16 h-16 mx-auto mb-4 bg-rose-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-rose-500/30">❤️</div>
      <h1 class="text-2xl font-bold font-romantic text-rose-600 mb-2">${spaceTitle}</h1>
      <p class="text-xs text-zinc-500 mb-6">Tệp đóng gói khởi chạy Vercel & Web Cặp Đôi</p>
      <div class="bg-rose-50 p-4 rounded-2xl text-left text-xs text-zinc-700 space-y-2">
        <p><strong>Hướng dẫn chạy Vercel:</strong></p>
        <p>1. Tải toàn bộ thư mục dự án lên GitHub.</p>
        <p>2. Đăng nhập vào <strong>Vercel.com</strong> và bấm <em>Add New &gt; Project</em>.</p>
        <p>3. Chọn repository của bạn, Vercel sẽ tự động phát hiện cấu hình Vite và chạy mượt mà ngay lập tức!</p>
      </div>
      <div class="mt-6">
        <a href="https://vercel.com/new" target="_blank" class="block w-full py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-sm shadow-md hover:opacity-90">
          Mở Vercel Để Deploy Ngay →
        </a>
      </div>
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // Download entire source code as .ZIP for GitHub upload
  const handleDownloadFullZip = () => {
    const link = document.createElement('a');
    link.href = '/foreverus-project.zip';
    link.download = 'foreverus-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setZipSuccess(true);
    setTimeout(() => setZipSuccess(false), 3000);
  };

  // Download full data backup JSON
  const handleDownloadBackupData = () => {
    const jsonStr = coupleService.exportCoupleDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `foreverus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const gitPushScript = `git remote add origin https://github.com/USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main`;

  const copyGitCommands = () => {
    navigator.clipboard.writeText(gitPushScript);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-zinc-900 p-6 sm:p-7 shadow-2xl border border-rose-100 dark:border-zinc-800 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-zinc-800 text-rose-500">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
                Đưa Lên GitHub & Deploy Vercel
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tải tệp hoặc đưa mã nguồn lên kho GitHub của bạn nhanh chóng
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('download')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'download'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Tải Tệp Về Máy
          </button>
          <button
            onClick={() => setActiveTab('github_guide')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'github_guide'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Cách Đưa Lên GitHub
          </button>
          <button
            onClick={() => setActiveTab('git_commands')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'git_commands'
                ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-zinc-500'
            }`}
          >
            Lệnh Git Trực Tiếp
          </button>
        </div>

        {/* Tab 1: Download Files */}
        {activeTab === 'download' && (
          <div className="space-y-4">
            {/* Download index.html */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-rose-50/70 to-pink-50/60 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-rose-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-rose-500" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Tải tệp index.html
                  </h3>
                </div>
                {downloadSuccess && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã tải xuống!
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Tệp HTML độc lập để chạy trên trình duyệt hoặc tải trực tiếp lên Vercel.
              </p>
              <button
                onClick={handleDownloadIndexHtml}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Tải Tệp index.html</span>
              </button>
            </div>

            {/* Download Full Source ZIP */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50/70 to-pink-50/60 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-purple-200 dark:border-zinc-700 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderArchive className="w-5 h-5 text-purple-600" />
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    Tải Toàn Bộ Mã Nguồn (.ZIP) Cho GitHub
                  </h3>
                </div>
                {zipSuccess && (
                  <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Đã tải ZIP!
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-300">
                Gói toàn bộ mã nguồn React, Tailwind, Vite, và Firebase. Giải nén hoặc kéo thả trực tiếp lên GitHub!
              </p>
              <button
                onClick={handleDownloadFullZip}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Download className="w-4 h-4" />
                <span>Tải File foreverus-project.zip</span>
              </button>
            </div>

            {/* Download Full Backup Data */}
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700 space-y-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-500" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  Sao Lưu Dữ Liệu Tình Yêu (JSON)
                </h3>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Xuất toàn bộ ảnh, mật thư, lịch hẹn và tọa độ thành file sao lưu JSON.
              </p>
              <button
                onClick={handleDownloadBackupData}
                className="py-2 px-3 rounded-xl bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-bold hover:bg-zinc-300 transition-colors inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải File JSON</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Easy GitHub & Vercel Guide */}
        {activeTab === 'github_guide' && (
          <div className="space-y-4 text-xs text-zinc-700 dark:text-zinc-300">
            <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-zinc-800/60 border border-rose-200 dark:border-zinc-700">
              <h4 className="font-bold text-sm text-rose-600 dark:text-rose-400 flex items-center gap-1.5 mb-2">
                <Sparkles className="w-4 h-4" />
                Cách tạo Repo GitHub siêu dễ (Không cần gõ lệnh)
              </h4>
              <ol className="space-y-2 list-decimal list-inside">
                <li>
                  Vào trang web <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-rose-500 font-bold underline">github.com/new</a> và đăng nhập tài khoản của bạn.
                </li>
                <li>
                  Đặt tên kho lưu trữ (ví dụ: <code className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded font-mono">dem-ngay-yeu</code>), chọn <strong>Public</strong> rồi bấm <strong>Create repository</strong>.
                </li>
                <li>
                  Tại trang kho mới vừa tạo, bấm nút <strong>"uploading an existing file"</strong>.
                </li>
                <li>
                  Kéo tệp <code className="px-1 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded font-mono">index.html</code> (vừa tải từ tab "Tải Tệp Về Máy") thả vào đó rồi bấm <strong>Commit changes</strong>.
                </li>
                <li>
                  Truy cập <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-rose-500 font-bold underline">vercel.com/new</a>, chọn repo đó và bấm <strong>Deploy</strong> là xong!
                </li>
              </ol>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Nhờ AI hỗ trợ push tự động qua chat:
              </h4>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Nếu bạn muốn tôi trực tiếp chạy lệnh đẩy lên GitHub giúp bạn, bạn chỉ cần:
                <br />
                1. Tạo 1 repo trống trên GitHub.
                <br />
                2. Gửi cho tôi <strong>link repo</strong> và <strong>Personal Access Token (PAT)</strong> của bạn trong khung chat, tôi sẽ chạy lệnh đẩy toàn bộ mã nguồn lên ngay lập tức!
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Git Terminal Commands */}
        {activeTab === 'git_commands' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-rose-500" />
                  Các lệnh để kết nối và đẩy lên GitHub:
                </span>
                <button
                  onClick={copyGitCommands}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 hover:underline"
                >
                  {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCmd ? 'Đã sao chép' : 'Sao chép lệnh'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-2xl bg-zinc-900 text-zinc-100 text-xs font-mono overflow-x-auto border border-zinc-800 leading-relaxed">
                {gitPushScript}
              </pre>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              * Thay <code className="text-rose-500">USERNAME</code> và <code className="text-rose-500">REPO_NAME</code> bằng tài khoản và tên kho của bạn trên GitHub.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <a
            href="https://vercel.com/new"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline"
          >
            <span>Mở Vercel.com</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold hover:opacity-90"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
