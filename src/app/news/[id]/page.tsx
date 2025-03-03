// src/app/news/[id]/page.tsx
"use client"
import { notFound } from "next/navigation";
import { mockNews } from "@/data/mockData";
import { FooterCrypto } from "@/components/sections/news/FooterCrypto";
import { Share2, BookmarkIcon } from "lucide-react";
import { use, useEffect, useState } from "react";
import { promises } from "dns";
import { useAuth } from "@/context/AuthContext";
import CommentSection from "@/components/Comments";

interface NewsDetailPageProps {
  params: { id: string } | Promise<{ id: string }>;
}
interface newsData
{
  header: string;
  title:string;
  content:string;
  footer: string;
  timeReading: number;
  userName: string;
  avatar:string;
  categoryId: number;
  imagesLink: string;
}

interface Comment {
  commentId: number;
  userFullName: string;
  userAvartar: string;
  content: string;
  createdAt: string;
}

export default function NewsDetailPage({ params }: NewsDetailPageProps) {
  const resolvedParams = params instanceof Promise ? params : Promise.resolve(params);
  const { id } = use(resolvedParams);
  const token = useAuth();
  const [item, setItem] = useState<newsData | null>(null);


  const [comments, setComments] = useState<Comment[]>([]);
  const [visibleCount, setVisibleCount] = useState(5); // hiển thị 5 comment đầu
  const [newComment, setNewComment] = useState("");


  useEffect(() => {
    if (!token || !token.token) return;
    const item = fetch(`http://localhost:5000/api/News/GetNewsByIdAsync?id=${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token.token}`
      }
    }
    ).then((res) => {
      if(!res.ok)
        throw new Error(`Http error! status: ${res.status}`);
      return res.json();
    }).then((data) => {
      console.log(data.data);
      setItem(data.data);
    }).catch((err) => console.log(err));
  }, [token, id])

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    fetch(`http://localhost:5000/api/Comments/AddComment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.token}`,
      },
      body: JSON.stringify({
        newsId: id,
        content: newComment,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Giả sử API trả về comment mới trong data.data
        setComments((prev) => [data.data, ...prev]);
        setNewComment("");
        setVisibleCount((prev) => prev + 1);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    if (!token || !token.token) return;
    fetch(`http://localhost:5000/api/Comment/GetListCommentByNews?newsID=${id}`, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Giả sử API trả về { data: Comment[] }
        setComments(data.data);
      })
      .catch((err) => console.log(err));
  }, [token, id]); useEffect(() => {
    if (!token || !token.token) return;
    fetch(`http://localhost:5000/api/Comment/GetListCommentByNews?newsID=${id}`, {
      headers: {
        Authorization: `Bearer ${token.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        // Giả sử API trả về { data: Comment[] }
        setComments(data.data);
      })
      .catch((err) => console.log(err));
  }, [token, id]);

  // Nếu không tìm thấy bài viết thì trả về notFound
  if (!item) {
    return <div>Vui lòng đăng nhập để xem chi tiết bài viết</div>;
  }
  const displayedComments = comments.slice(0, visibleCount);
  return (
    
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {/* Phần header của bài viết */}
      <header className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          {/* Giả sử bạn có một logo hoặc tên trang */}
          <div className="flex items-center gap-2">
            <img
              src="/placeholder/400/250.jpg"
              alt="Coin98 Insights"
              className="w-8 h-8 rounded-full"
            />
            <span className="font-semibold">{item.userName}</span>
          </div>
          <button className="px-3 py-1 border rounded-full text-sm hover:bg-gray-100">
            Follow
          </button>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          {item.title}
        </h1>

        {/* Thông tin tác giả, thời gian */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <img
            src="/api/placeholder/24/24"
            alt={item.userName}
            className="w-6 h-6 rounded-full"
          />
          <span>{item.userName}</span>
          <span>•</span>
          <span>{}</span>
          <span>•</span>
          <span>{item.timeReading}</span>
        </div>
      </header>

      {/* Nội dung chính của bài viết */}
      <article className="space-y-4 leading-relaxed">
        {/* Ảnh minh họa bài viết nếu cần */}
        <img
          src={item.imagesLink || "/placeholder/400/250.jpg"}
          alt={item.title}
          className="w-full h-auto object-cover rounded-md"
        />

        {/* Đoạn text mô phỏng */}
        <p>{item.content}</p>
      </article>

      {/* Nút share, bookmark... (nếu muốn) */}
      <div className="flex items-center gap-4">
        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100">
          <Share2 size={20} />
          Share
        </button>
        <button className="flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100">
          <BookmarkIcon size={20} />
          Bookmark
        </button>
      </div>

       <CommentSection newsId={Number(id)}/>

      {/* Footer của bài viết - Related Posts */}
      <section className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-4">Related Posts</h2>
        {/* Render các bài viết liên quan, có thể là mockNews hoặc API */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockNews.slice(0, 4).map((related) => (
            <div key={related.id} className="border rounded-md p-3 space-y-2">
              <img
                src={related.image}
                alt={related.title}
                className="w-full h-32 object-cover rounded-md"
              />
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <img
                  src="/api/placeholder/24/24"
                  alt={related.author}
                  className="w-5 h-5 rounded-full"
                />
                <span>{related.author}</span>
                <span>•</span>
                <span>{related.timeAgo}</span>
              </div>
              <h3 className="font-semibold text-base line-clamp-2">
                {related.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-2">
                {related.excerpt}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer toàn trang (nếu muốn dùng) */}
      <FooterCrypto />
    </div>
  );
}
