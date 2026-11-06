import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trophy,
  Sparkles,
  Camera,
  Heart,
  Search,
  Filter,
  Trash2,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BucketListItem } from '../types';

interface CoupleBucketListProps {
  partner1Name: string;
  partner2Name: string;
  bucketListData?: string;
  onSaveBucketList: (items: BucketListItem[]) => void;
}

const DEFAULT_100_BUCKET_LIST: Omit<BucketListItem, 'isCompleted'>[] = [
  // 💖 Hẹn hò lãng mạn (Romantic Dates)
  { id: 'b1', title: 'Cùng nhau ngắm bình minh trên bờ biển vắng 🌅', category: 'romantic' },
  { id: 'b2', title: 'Đi dã ngoại công viên với thảm cỏ và giỏ trái cây 🧺', category: 'romantic' },
  { id: 'b3', title: 'Cùng ăn tối lãng mạn dưới ánh nến và rượu vang 🕯️', category: 'romantic' },
  { id: 'b4', title: 'Ngồi hàng ghế Sweetbox xem phim tình cảm ở rạp 🍿', category: 'romantic' },
  { id: 'b5', title: 'Ngắm pháo hoa đêm giao thừa và trao nụ hôn đầu năm 🎆', category: 'romantic' },
  { id: 'b6', title: 'Đi ngắm sao trời và cùng nhau ước nguyện tương lai ✨', category: 'romantic' },
  { id: 'b7', title: 'Hẹn hò góc quán cà phê ban công ngắm mưa rào ☕', category: 'romantic' },
  { id: 'b8', title: 'Cùng nhau đi dạo chợ hoa ngày Tết 🌸', category: 'romantic' },
  { id: 'b9', title: 'Cùng chụp một bộ ảnh photobooth biểu cảm hài hước 📸', category: 'romantic' },
  { id: 'b10', title: 'Đạp vịt trên hồ Tây lúc hoàng hôn buông xuống 🦆', category: 'romantic' },
  { id: 'b11', title: 'Nắm tay nhau đi dạo phố đi bộ suốt đêm 🚶‍♂️🚶‍♀️', category: 'romantic' },
  { id: 'b12', title: 'Bất ngờ tặng một bó hoa hồng đỏ không nhân dịp gì cả 🌹', category: 'romantic' },
  { id: 'b13', title: 'Cùng viết thư tay gửi cho nhau 5 năm sau ✉️', category: 'romantic' },
  { id: 'b14', title: 'Cùng đi xem một đêm nhạc acoustic của ca sĩ yêu thích 🎤', category: 'romantic' },
  { id: 'b15', title: 'Ôm nhau nghe tiếng mưa rơi trên mái nhà 🌧️', category: 'romantic' },
  { id: 'b16', title: 'Cùng làm bánh kem sinh nhật tặng đối phương 🎂', category: 'romantic' },
  { id: 'b17', title: 'Cùng đón hoàng hôn tím hồng trên đỉnh đồi 🌄', category: 'romantic' },
  { id: 'b18', title: 'Tặng người ấy một món quà tự tay đan/thêu/làm thủ công 🎁', category: 'romantic' },
  { id: 'b19', title: 'Cùng ngắm tuyết rơi hoặc đi khu trượt băng nhân tạo ❄️', category: 'romantic' },
  { id: 'b20', title: 'Cùng nhau nằm trên bãi cỏ ngắm những đám mây trôi ☁️', category: 'romantic' },

  // 🗺️ Khám phá & Du lịch (Travel & Adventure)
  { id: 'b21', title: 'Cùng vi vu Đà Lạt săn mây sáng sớm 🌲', category: 'travel' },
  { id: 'b22', title: 'Phượt xe máy qua cung đèo tuyệt đẹp ngắm biển 🛵', category: 'travel' },
  { id: 'b23', title: 'Đi du lịch nước ngoài cùng nhau lần đầu tiên ✈️', category: 'travel' },
  { id: 'b24', title: 'Cắm trại qua đêm đốt lửa trại và nướng khoai 🏕️', category: 'travel' },
  { id: 'b25', title: 'Chèo thuyền kayak hoặc chèo SUP trên hồ nước trong xanh 🚣', category: 'travel' },
  { id: 'b26', title: 'Đi cáp treo ngắm toàn cảnh thành phố từ trên cao 🚡', category: 'travel' },
  { id: 'b27', title: 'Thưởng thức ẩm thực đường phố tại chợ đêm địa phương 🍢', category: 'travel' },
  { id: 'b28', title: 'Lặn biển ngắm rạn san hô rực rỡ sắc màu 🐠', category: 'travel' },
  { id: 'b29', title: 'Ở resort nghỉ dưỡng sát bờ biển nghe sóng vỗ 🏖️', category: 'travel' },
  { id: 'b30', title: 'Đi tàu hỏa ngắm cảnh qua những cánh đồng xanh ngát 🚂', category: 'travel' },
  { id: 'b31', title: 'Cùng ghé thăm phố cổ Hội An thả hoa đăng ước nguyện 🏮', category: 'travel' },
  { id: 'b32', title: 'Chinh phục đỉnh núi Fansipan ngắm biển mây ngút ngàn 🏔️', category: 'travel' },
  { id: 'b33', title: 'Đi công viên giải trí chơi hết tất cả các trò cảm giác mạnh 🎢', category: 'travel' },
  { id: 'b34', title: 'Lạc lối trong một nông trại dâu tây tự tay hái quả 🍓', category: 'travel' },
  { id: 'b35', title: 'Ngắm hải đăng biển đêm rọi sáng đại dương 🗼', category: 'travel' },
  { id: 'b36', title: 'Cùng nhau dậy lúc 4h sáng để chuẩn bị hành lý đi chơi ⏰', category: 'travel' },
  { id: 'b37', title: 'Tắm suối nước nóng tự nhiên giữa núi rừng ♨️', category: 'travel' },
  { id: 'b38', title: 'Cùng ngắm hoa anh đào nở rộ mùa xuân 🌸', category: 'travel' },
  { id: 'b39', title: 'Đi xe đạp đôi thong dong dạo quanh bờ hồ 🚲', category: 'travel' },
  { id: 'b40', title: 'Check-in tại cột mốc số 0 hoặc cực Bắc/Nam tổ quốc 📍', category: 'travel' },

  // 🏡 Đời sống ngọt ngào (Sweet Daily Life)
  { id: 'b41', title: 'Cùng nhau vào bếp chuẩn bị mâm cơm gia đình ấm cúng 🍳', category: 'sweet_life' },
  { id: 'b42', title: 'Mặc áo thun đôi đi dạo siêu thị mua sắm cuối tuần 🛒', category: 'sweet_life' },
  { id: 'b43', title: 'Cùng nhau chăm sóc và tắm rửa cho thú cưng 🐶', category: 'sweet_life' },
  { id: 'b44', title: 'Nằm cạnh nhau cùng đắp mặt nạ dưỡng da và chụp ảnh ngố 🧖‍♀️', category: 'sweet_life' },
  { id: 'b45', title: 'Cùng đọc chung một cuốn sách và chia sẻ cảm nghĩ 📚', category: 'sweet_life' },
  { id: 'b46', title: 'Một người ốm, người kia nấu cháo bón tận miệng 🥣', category: 'sweet_life' },
  { id: 'b47', title: 'Cùng tổng vệ sinh dọn dẹp và trang trí phòng ngủ 🧹', category: 'sweet_life' },
  { id: 'b48', title: 'Massage vai và bóp chân cho người ấy sau ngày làm mệt mỏi 💆', category: 'sweet_life' },
  { id: 'b49', title: 'Cùng thức trắng một đêm nói chuyện tâm sự trên trời dưới đất 🌙', category: 'sweet_life' },
  { id: 'b50', title: 'Cùng nhau tập thể dục / chạy bộ rèn luyện sức khỏe 🏃‍♂️', category: 'sweet_life' },
  { id: 'b51', title: 'Sấy tóc cho đối phương sau khi gội đầu 💨', category: 'sweet_life' },
  { id: 'b52', title: 'Cùng nhau trồng một chậu cây nhỏ và tưới nước mỗi ngày 🌱', category: 'sweet_life' },
  { id: 'b53', title: 'Tự tay làm một cốc trà sữa hoặc món ăn vặt người ấy mê 🧋', category: 'sweet_life' },
  { id: 'b54', title: 'Gối đầu lên đùi người ấy xem trọn một bộ phim truyền hình 🛋️', category: 'sweet_life' },
  { id: 'b55', title: 'Cùng nhau ghép xong một bức tranh lego / xếp hình 1000 mảnh 🧩', category: 'sweet_life' },
  { id: 'b56', title: 'Chụp lại biểu cảm lầy lội lúc người ấy đang ngủ say 😴', category: 'sweet_life' },
  { id: 'b57', title: 'Được người ấy hôn trán trước khi đi ngủ mỗi đêm 💤', category: 'sweet_life' },
  { id: 'b58', title: 'Cùng nhau lập kế hoạch chi tiêu và tiết kiệm tiền chung 💰', category: 'sweet_life' },
  { id: 'b59', title: 'Cùng nhau lựa chọn nội thất cho ngôi nhà tương lai 🛋️', category: 'sweet_life' },
  { id: 'b60', title: 'Ăn kem giữa mùa đông lạnh buốt và cười sảng khoái 🍦', category: 'sweet_life' },

  // 🌟 Cột mốc tương lai (Milestones)
  { id: 'b61', title: 'Kỷ niệm 1 năm yêu nhau với bữa tiệc ấm cúng 🥂', category: 'milestone' },
  { id: 'b62', title: 'Chính thức ra mắt gia đình và bố mẹ hai bên 👨‍👩‍👧‍👦', category: 'milestone' },
  { id: 'b63', title: 'Đeo nhẫn đôi minh chứng cho tình yêu bền chặt 💍', category: 'milestone' },
  { id: 'b64', title: 'Kỷ niệm 1000 ngày bên nhau cùng vượt qua sóng gió 📅', category: 'milestone' },
  { id: 'b65', title: 'Màn cầu hôn bất ngờ đong đầy nước mắt hạnh phúc 👰🤵', category: 'milestone' },
  { id: 'b66', title: 'Cùng đi thử váy cưới và đồ vest trang trọng 👗', category: 'milestone' },
  { id: 'b67', title: 'Chụp bộ ảnh cưới trong mơ tại nơi kỷ niệm 📸', category: 'milestone' },
  { id: 'b68', title: 'Mua hoặc thuê căn nhà đầu tiên của hai đứa 🔑', category: 'milestone' },
  { id: 'b69', title: 'Đón thành viên mới (bé cún hoặc bé mèo chung đầu tiên) 🐾', category: 'milestone' },
  { id: 'b70', title: 'Kỷ niệm 5 năm ngày yêu cùng ngắm lại album ảnh cũ 📖', category: 'milestone' },
  { id: 'b71', title: 'Tổ chức đám cưới ấm cúng trong lời chúc phúc của mọi người 💒', category: 'milestone' },
  { id: 'b72', title: 'Chuyến đi hưởng tuần trăng mật ngọt ngào 🏖️', category: 'milestone' },
  { id: 'b73', title: 'Cùng nhau vượt qua một khó khăn lớn trong cuộc sống 💪', category: 'milestone' },
  { id: 'b74', title: 'Cùng nhau đạt được mục tiêu công việc hoặc thăng chức 🏆', category: 'milestone' },
  { id: 'b75', title: 'Kỷ niệm đám cưới bạc (25 năm) vẫn nắm chặt tay nhau 👴👵', category: 'milestone' },

  // 🤪 Trải nghiệm tinh nghịch (Crazy & Fun Adventures)
  { id: 'b76', title: 'Cùng nhau chơi trò ném bóng nước hoặc té nước 💦', category: 'crazy' },
  { id: 'b77', title: 'Thử ăn món siêu cay cùng nhau và thi ai chịu được lâu hơn 🌶️', category: 'crazy' },
  { id: 'b78', title: 'Dắt tay nhau vào nhà ma la hét muốn bể cổ họng 👻', category: 'crazy' },
  { id: 'b79', title: 'Hát karaoke gào thét hết mình mặc kệ người khác đánh giá 🎤', category: 'crazy' },
  { id: 'b80', title: 'Trang điểm cho bạn trai thành một cô gái siêu hài 💄', category: 'crazy' },
  { id: 'b81', title: 'Thức đến 3 giờ sáng để ăn mì tôm xúc xích xem phim kinh dị 🍜', category: 'crazy' },
  { id: 'b82', title: 'Nhảy múa điên cuồng theo điệu nhạc trong phòng ngủ 💃🕺', category: 'crazy' },
  { id: 'b83', title: 'Cùng trốn cơn mưa rào dưới hiên nhà lạ và ngắm mưa rơi 🌧️', category: 'crazy' },
  { id: 'b84', title: 'Tổ chức trò chơi ai thua phải phục tùng mệnh lệnh 24 giờ 👑', category: 'crazy' },
  { id: 'b85', title: 'Đổi vai: 1 ngày bạn nam làm bạn nữ và ngược lại 🔄', category: 'crazy' },
  { id: 'b86', title: 'Chơi bắn súng sơn hoặc đua xe Go-Kart tốc độ 🏎️', category: 'crazy' },
  { id: 'b87', title: 'Cùng tham gia một giải chạy việt dã 5km/10km 🏅', category: 'crazy' },
  { id: 'b88', title: 'Tự vẽ tranh chân dung hài hước của đối phương 🎨', category: 'crazy' },
  { id: 'b89', title: 'Cùng nhau thử một kiểu tóc mới toanh 💇', category: 'crazy' },
  { id: 'b90', title: 'Cùng làm video Tiktok / Reel nhảy bắt trend vui nhộn 📱', category: 'crazy' },
  { id: 'b91', title: 'Dùng một chiếc thìa to ăn chung một quả dưa hấu ướp lạnh 🍉', category: 'crazy' },
  { id: 'b92', title: 'Đóng giả làm hai người lạ tán tỉnh nhau tại quán bar/cà phê 🍸', category: 'crazy' },
  { id: 'b93', title: 'Cùng nhau đi câu cá cả ngày không bắt được con nào vẫn vui 🎣', category: 'crazy' },
  { id: 'b94', title: 'Ném tuyết hoặc té bùn vào nhau rồi cùng cười ❄️', category: 'crazy' },
  { id: 'b95', title: 'Chụp một bức ảnh hôn nhau ở nơi đông người qua lại 👩‍❤️‍💋‍👨', category: 'crazy' },
  { id: 'b96', title: 'Cùng nhau đi sở thú cho hươu cao cổ và voi ăn 🦒', category: 'crazy' },
  { id: 'b97', title: 'Cùng nằm trên thảm phòng khách nghe trọn vẹn 1 album nhạc 🎶', category: 'crazy' },
  { id: 'b98', title: 'Tự tạo một công thức cocktail hoặc sinh tố bí mật của hai đứa 🍹', category: 'crazy' },
  { id: 'b99', title: 'Hôn nhau dưới nước ở hồ bơi hoặc bãi biển 🏊‍♂️', category: 'crazy' },
  { id: 'b100', title: 'Cùng nhau già đi và mỗi sáng vẫn mỉm cười chào nhau ❤️', category: 'romantic' },
];

export const CoupleBucketList: React.FC<CoupleBucketListProps> = ({
  partner1Name,
  partner2Name,
  bucketListData,
  onSaveBucketList,
}) => {
  const [items, setItems] = useState<BucketListItem[]>(() => {
    if (bucketListData) {
      try {
        const parsed = JSON.parse(bucketListData);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    // Initial generation
    return DEFAULT_100_BUCKET_LIST.map((item, idx) => ({
      ...item,
      isCompleted: idx < 6, // 6 sample completed
      completedAt: idx < 6 ? '2024-03-14' : undefined,
    }));
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'todo'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<BucketListItem['category']>('romantic');
  const [photoModalItem, setPhotoModalItem] = useState<BucketListItem | null>(null);

  const completedCount = items.filter((i) => i.isCompleted).length;
  const progressPercent = Math.round((completedCount / items.length) * 100);

  // Couple Achievement Level Badge
  const getRankBadge = (count: number) => {
    if (count >= 80) return { title: 'Tri Kỷ Trọn Đời 👑', desc: 'Tình yêu bất diệt qua thời gian' };
    if (count >= 50) return { title: 'Cặp Đôi Vàng 💖', desc: 'Hơn một nửa chặng đường gắn kết' };
    if (count >= 25) return { title: 'Cặp Đôi Ngọt Ngào 🥰', desc: 'Tràn ngập kỷ niệm đong đầy' };
    if (count >= 10) return { title: 'Cặp Đôi Khởi Đầu ✨', desc: 'Bắt đầu hành trình ước hẹn' };
    return { title: 'Mầm Yêu Mới Chớm 🌱', desc: 'Hãy cùng nhau hoàn thành nhé!' };
  };

  const rank = getRankBadge(completedCount);

  // Toggle Complete Item
  const handleToggle = (id: string) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const nextState = !item.isCompleted;
        if (nextState) {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#ff4d6d', '#ff758f', '#ffd166'],
          });
        }
        return {
          ...item,
          isCompleted: nextState,
          completedAt: nextState ? new Date().toISOString().split('T')[0] : undefined,
        };
      }
      return item;
    });

    setItems(updated);
    onSaveBucketList(updated);
  };

  // Add custom item
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newItem: BucketListItem = {
      id: 'custom-' + Date.now(),
      title: newTitle.trim(),
      category: newCategory,
      isCompleted: false,
      addedBy: partner1Name,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    onSaveBucketList(updated);
    setNewTitle('');
    setShowAddModal(false);

    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.8 },
    });
  };

  // Save photo proof
  const handleUploadProofPhoto = (e: React.ChangeEvent<HTMLInputElement>, item: BucketListItem) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.8);

          const updated = items.map((i) =>
            i.id === item.id ? { ...i, proofPhoto: compressed, isCompleted: true } : i
          );
          setItems(updated);
          onSaveBucketList(updated);
          setPhotoModalItem(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'completed' && item.isCompleted) ||
      (filterStatus === 'todo' && !item.isCompleted);
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-6">
      {/* Header Banner & Level Ranking */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>100 Điều Ước Hẹn Hò Cặp Đôi</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 font-bold">
                  {completedCount}/{items.length} Điều
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Những khoảnh khắc ngọt ngào {partner1Name} & {partner2Name} muốn cùng nhau làm trong đời
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm điều ước mới</span>
          </button>
        </div>

        {/* Progress Bar & Level Card */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-zinc-800/80 border border-rose-200/80 dark:border-zinc-700/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Danh hiệu: <strong>{rank.title}</strong>
            </span>
            <span className="font-mono font-bold text-zinc-700 dark:text-zinc-300">
              Đạt {progressPercent}% mục tiêu
            </span>
          </div>

          <div className="w-full h-3 bg-white dark:bg-zinc-900 rounded-full overflow-hidden border border-rose-200 dark:border-zinc-700 shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 text-right">
            {rank.desc}
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="space-y-3 pt-1">
          <div className="flex flex-col sm:flex-row gap-2.5">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm điều ước hẹn hò..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-2 focus:ring-rose-400"
              />
            </div>

            {/* Status Segmented Control */}
            <div className="flex p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-xs font-semibold shrink-0">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'all'
                    ? 'bg-white dark:bg-zinc-900 shadow-xs text-rose-500 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Tất cả ({items.length})
              </button>
              <button
                onClick={() => setFilterStatus('todo')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'todo'
                    ? 'bg-white dark:bg-zinc-900 shadow-xs text-rose-500 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Chưa làm ({items.length - completedCount})
              </button>
              <button
                onClick={() => setFilterStatus('completed')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filterStatus === 'completed'
                    ? 'bg-white dark:bg-zinc-900 shadow-xs text-rose-500 font-bold'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Đã xong ({completedCount})
              </button>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Tất cả chủ đề ✨' },
              { id: 'romantic', label: 'Hẹn hò lãng mạn 💖' },
              { id: 'travel', label: 'Khám phá & Du lịch 🗺️' },
              { id: 'sweet_life', label: 'Đời sống ngọt ngào 🏡' },
              { id: 'milestone', label: 'Cột mốc tương lai 🌟' },
              { id: 'crazy', label: 'Trải nghiệm lầy lội 🤪' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all font-semibold ${
                  selectedCategory === cat.id
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-rose-500'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bucket List Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-400 text-xs">
            Không tìm thấy điều ước nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 rounded-3xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                item.isCompleted
                  ? 'bg-rose-50/50 dark:bg-zinc-850/80 border-rose-200 dark:border-zinc-700/80'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-rose-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggle(item.id)}
                  className="mt-0.5 shrink-0 text-rose-500 hover:scale-110 active:scale-95 transition-transform"
                >
                  {item.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 fill-rose-500 text-white" />
                  ) : (
                    <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-600 hover:text-rose-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p
                    onClick={() => handleToggle(item.id)}
                    className={`text-xs sm:text-sm font-semibold cursor-pointer select-none leading-snug transition-all ${
                      item.isCompleted
                        ? 'line-through text-zinc-400 dark:text-zinc-500 font-normal'
                        : 'text-zinc-800 dark:text-zinc-100'
                    }`}
                  >
                    {item.title}
                  </p>

                  {item.completedAt && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                      <Calendar className="w-3 h-3" />
                      Hoàn thành ngày {item.completedAt}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions: Photo proof */}
              <div className="flex items-center justify-between pt-2 border-t border-rose-100/60 dark:border-zinc-800/80">
                {item.proofPhoto ? (
                  <button
                    onClick={() => setPhotoModalItem(item)}
                    className="flex items-center gap-1 text-[11px] text-rose-500 font-bold hover:underline"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Xem ảnh chứng nhận</span>
                  </button>
                ) : (
                  <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-rose-500 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Thêm ảnh kỷ niệm</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleUploadProofPhoto(e, item)}
                      className="hidden"
                    />
                  </label>
                )}

                <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                  #{idx + 1}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Add Custom Bucket Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-rose-500" />
                <span>Thêm điều ước của hai bạn</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Nội dung điều ước
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ví dụ: Cùng đi ngắm cực quang ở Na Uy 🌌"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Chủ đề
                </label>
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as BucketListItem['category'])
                  }
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs"
                >
                  <option value="romantic">Hẹn hò lãng mạn 💖</option>
                  <option value="travel">Khám phá & Du lịch 🗺️</option>
                  <option value="sweet_life">Đời sống ngọt ngào 🏡</option>
                  <option value="milestone">Cột mốc tương lai 🌟</option>
                  <option value="crazy">Trải nghiệm tinh nghịch 🤪</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold shadow-xs hover:from-rose-600"
                >
                  Thêm vào danh sách ✨
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Proof Photo */}
      {photoModalItem && photoModalItem.proofPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-zinc-900 border border-rose-200 dark:border-zinc-800 p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate pr-2">
                {photoModalItem.title}
              </h4>
              <button
                onClick={() => setPhotoModalItem(null)}
                className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 flex items-center justify-center text-xs shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden max-h-80 border border-zinc-200 dark:border-zinc-700">
              <img
                src={photoModalItem.proofPhoto}
                alt="Proof"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Đã hoàn thành ngày {photoModalItem.completedAt}</span>
              <button
                onClick={() => {
                  const updated = items.map((i) =>
                    i.id === photoModalItem.id ? { ...i, proofPhoto: undefined } : i
                  );
                  setItems(updated);
                  onSaveBucketList(updated);
                  setPhotoModalItem(null);
                }}
                className="text-red-500 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa ảnh này</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
