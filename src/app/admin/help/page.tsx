import type { Metadata } from "next"
import {
  IconBook,
  IconFileText,
  IconImageInPicture,
  IconTag,
  IconUsers,
  IconLayoutList,
  IconSearch,
  IconSettings,
  IconAlertCircle,
  IconCircle,
  IconHelpCircle,
} from "@tabler/icons-react"

import { requireAdmin } from "@/lib/admin-auth"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Trợ giúp",
}

interface HelpSection {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  details: string[]
}

const helpSections: HelpSection[] = [
  {
    icon: IconFileText,
    title: "Quản lý Bài viết",
    description: "Tạo, chỉnh sửa và quản lý nội dung bài viết của bạn",
    details: [
      "Nhấp vào 'Tạo mới' để tạo bài viết mới",
      "Sử dụng trình soạn thảo rich text để định dạng nội dung",
      "Đặt trạng thái: Nháp (Draft), Đã xuất bản (Published), Đã lên lịch (Scheduled)",
      "Thêm tags, danh mục, và tác giả để tổ chức nội dung",
      "Tự động lưu nháp để tránh mất dữ liệu",
      "Xem trước bài viết trước khi xuất bản",
    ],
  },
  {
    icon: IconLayoutList,
    title: "Danh mục & Tags",
    description: "Tổ chức nội dung bằng cách phân loại thành danh mục và tags",
    details: [
      "Danh mục: Dùng cho phân loại chính (News, Tutorial, Review, v.v.)",
      "Tags: Dùng cho từ khóa, chủ đề liên quan",
      "Mỗi danh mục có URL slug riêng",
      "Seo URL: Đảm bảo slug thân thiện với SEO",
      "Bạn có thể tạo danh mục lồng nhau",
      "Xóa danh mục sẽ không xóa bài viết, chỉ gỡ liên kết",
    ],
  },
  {
    icon: IconUsers,
    title: "Tác giả",
    description: "Quản lý thông tin tác giả và tiểu sử",
    details: [
      "Thêm tác giả mới cùng thông tin tiểu sử",
      "Upload ảnh đại diện cho tác giả",
      "Thêm liên kết mạng xã hội (website, Twitter, LinkedIn, v.v.)",
      "Liên kết bài viết với tác giả chính",
      "Xem thống kê bài viết theo tác giả",
      "Lọc bài viết theo tác giả",
    ],
  },
  {
    icon: IconImageInPicture,
    title: "Quản lý Media",
    description: "Tải lên và quản lý hình ảnh, video và các tệp media khác",
    details: [
      "Tải lên hình ảnh, video, và tệp media",
      "Tự động tạo thumbnail cho hình ảnh",
      "Tổ chức media theo thư mục (Avatars, Branding, Thumbnails)",
      "Sao chép URL media để sử dụng trong bài viết",
      "Xóa media không sử dụng để tiết kiệm dung lượng",
      "Hỗ trợ các định dạng phổ biến: JPG, PNG, GIF, WebP, MP4, v.v.",
    ],
  },
  {
    icon: IconLayoutList,
    title: "So sánh (Comparisons)",
    description: "Tạo bảng so sánh sản phẩm, dịch vụ hoặc công cụ",
    details: [
      "Tạo bảng so sánh giữa các mục",
      "Thêm xác suất chiến thắng (winner badge)",
      "Tùy chỉnh các cột và hàng của bảng",
      "Đánh dấu mục nào là 'chiến thắng'",
      "Sử dụng so sánh trong bài viết để tăng độ hấp dẫn",
      "Cập nhật so sánh khi các mục được cập nhật",
    ],
  },
  {
    icon: IconTag,
    title: "Dịch vụ & Công cụ",
    description: "Quản lý danh mục dịch vụ và công cụ",
    details: [
      "Tạo dịch vụ mới với mô tả, giá cả, tính năng",
      "Tạo công cụ với đánh giá, đặc điểm, liên kết",
      "Gắn thẻ dịch vụ và công cụ với danh mục",
      "Sắp xếp dịch vụ theo mức độ phổ biến",
      "Thêm liên kết bên ngoài (affiliate links)",
      "Quản lý trạng thái (hoạt động, không hoạt động, v.v.)",
    ],
  },
  {
    icon: IconSearch,
    title: "Chuyển hướng (Redirects)",
    description: "Quản lý chuyển hướng URL 301, 302",
    details: [
      "Tạo chuyển hướng từ URL cũ sang URL mới",
      "Chọn loại chuyển hướng (301 permanent, 302 temporary, v.v.)",
      "Tìm kiếm chuyển hướng hiện có",
      "Xóa chuyển hướng không cần thiết",
      "Sử dụng để duy trì SEO khi thay đổi URL",
      "Hữu ích khi di chuyển hoặc cấu trúc lại website",
    ],
  },
  {
    icon: IconSettings,
    title: "Cài đặt",
    description: "Quản lý cài đặt chung của trang web",
    details: [
      "Tên trang web (Site Name)",
      "Mô tả trang web (Site Description)",
      "Logo và favicon",
      "Cài đặt SEO mặc định (Meta tags, Open Graph)",
      "Liên kết mạng xã hội",
      "Thông tin liên hệ",
      "Cài đặt theme (sáng/tối)",
    ],
  },
]

const faqs = [
  {
    question: "Làm cách nào để lên lịch xuất bản một bài viết?",
    answer:
      "Khi tạo/chỉnh sửa bài viết, chọn trạng thái 'Đã lên lịch' (Scheduled) và đặt ngày giờ xuất bản. Bài viết sẽ tự động xuất bản vào thời gian được chỉ định.",
  },
  {
    question: "Tôi có thể khôi phục bài viết đã xóa không?",
    answer:
      "Hiện tại, bài viết đã xóa không thể khôi phục được. Hãy sao lưu dữ liệu thường xuyên. Thay vào đó, bạn có thể lưu trữ bài viết thay vì xóa nó.",
  },
  {
    question: "SEO URL (slug) có thể thay đổi sau khi xuất bản không?",
    answer:
      "Có thể, nhưng nên tạo chuyển hướng (Redirects) từ URL cũ sang URL mới để bảo tồn SEO và tránh lỗi 404.",
  },
  {
    question: "Làm cách nào để nhập dữ liệu hàng loạt?",
    answer:
      "Hiện tại chưa hỗ trợ nhập CSV hàng loạt. Bạn có thể tạo bài viết, danh mục, tags một cách thủ công. Liên hệ với nhóm phát triển để yêu cầu tính năng này.",
  },
  {
    question: "Các bài viết lưu nháp được lưu tự động không?",
    answer:
      "Có, các bài viết lưu nháp được lưu tự động khi bạn nhập dữ liệu. Nếu trình duyệt bị đóng đột ngột, dữ liệu của bạn vẫn được lưu.",
  },
  {
    question: "Tôi có thể hạn chế quyền truy cập của người dùng khác không?",
    answer:
      "Nếu bạn có vai trò quản trị viên, bạn có quyền truy cập đầy đủ. Hệ thống hỗ trợ phân quyền dựa trên vai trò (Role-based Access Control). Liên hệ quản trị viên chính để thiết lập.",
  },
  {
    question: "Kích thước tối đa của hình ảnh tải lên là bao nhiêu?",
    answer:
      "Kích thước tối đa tùy thuộc vào cấu hình máy chủ. Thông thường, giới hạn là 10MB. Hãy nén hình ảnh trước khi tải lên để tăng tốc độ.",
  },
  {
    question: "Làm cách nào để xem số lượt xem hoặc thống kê bài viết?",
    answer:
      "Thống kê được hiển thị trong bảng bài viết. Bạn có thể xem lượt xem, ngày tạo, trạng thái, tác giả, v.v. Tính năng phân tích chi tiết sẽ được thêm trong tương lai.",
  },
]

const tips = [
  {
    title: "Tối ưu hóa SEO",
    description:
      "Sử dụng slug thân thiện với SEO, thêm meta description, sử dụng heading đúng cách (H1, H2, H3), và thêm keywords liên quan.",
  },
  {
    title: "Chia sẻ nội dung hiệu quả",
    description:
      "Sử dụng Open Graph metadata để tạo hình ảnh đẹp khi chia sẻ trên mạng xã hội. Hãy chắc chắn rằng hình ảnh đặc trưng (featured image) được đặt.",
  },
  {
    title: "Tổ chức nội dung",
    description:
      "Sử dụng danh mục chính để phân loại lớn, và tags để chỉ định các chủ đề liên quan. Điều này giúp người dùng tìm kiếm nội dung dễ hơn.",
  },
  {
    title: "Sao lưu thường xuyên",
    description:
      "Hãy tạo bản sao lưu của dữ liệu thường xuyên. Nếu máy chủ gặp sự cố, bạn sẽ không mất dữ liệu quan trọng.",
  },
  {
    title: "Sử dụng trình soạn thảo hiệu quả",
    description:
      "Làm quen với các tính năng của trình soạn thảo như định dạng nâng cao, thêm liên kết, chèn hình ảnh, và bảng biểu.",
  },
  {
    title: "Kiểm tra liên kết hỏng",
    description:
      "Định kỳ kiểm tra các liên kết trong bài viết để đảm bảo chúng vẫn hoạt động. Liên kết hỏng ảnh hưởng xấu đến SEO.",
  },
]

export default async function HelpPage() {
  await requireAdmin()

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Trợ giúp & Hướng dẫn</h1>
        <p className="text-muted-foreground">
          Tìm hiểu cách sử dụng các tính năng quản trị để quản lý nội dung và trang web của bạn.
        </p>
      </div>

      {/* Help Sections */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Các Tính Năng Chính</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {helpSections.map((section) => {
            const Icon = section.icon
            return (
              <Card key={section.title} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-primary mt-1 shrink-0" />
                    <div className="space-y-1">
                      <CardTitle className="text-base">{section.title}</CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {section.details.map((detail, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-primary mt-0.5 shrink-0">•</span>
                        <span className="text-muted-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Tips Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Mẹo & Thủ thuật</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {tips.map((tip) => (
            <Card key={tip.title}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <IconCircle className="h-5 w-5 text-green-600 mt-1 shrink-0" />
                  <div>
                    <CardTitle className="text-base">{tip.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQs Section */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Câu Hỏi Thường Gặp</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex items-start gap-3">
                  <IconHelpCircle className="h-5 w-5 text-blue-600 mt-1 shrink-0" />
                  <CardTitle className="text-base">{faq.question}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Important Notes */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Lưu Ý Quan Trọng</h2>
        <div className="space-y-4">
          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-900">
            <CardHeader>
              <div className="flex items-start gap-3">
                <IconAlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-1 shrink-0" />
                <div>
                  <CardTitle className="text-base text-yellow-900 dark:text-yellow-100">
                    Quyền Truy Cập
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Chỉ người dùng có vai trò quản trị viên mới có quyền truy cập các tính năng này. Nếu bạn cần
                cấp quyền cho người dùng khác, hãy liên hệ với quản trị viên chính.
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
            <CardHeader>
              <div className="flex items-start gap-3">
                <IconBook className="h-5 w-5 text-blue-600 dark:text-blue-500 mt-1 shrink-0" />
                <div>
                  <CardTitle className="text-base text-blue-900 dark:text-blue-100">
                    Tài Liệu Thêm
                  </CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Để tìm hiểu thêm về các tính năng nâng cao, hãy liên hệ với đội hỗ trợ hoặc xem tài liệu đầy đủ
                trên trang web của dự án.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
