// "use client";

// import { useEffect, useState } from "react";
// import { useLanguage } from "@/app/context/LanguageContext";

// const PLACEHOLDER_IMAGE_URL = "/image/Banner.bmp";

// export default function HeroBanner() {
//   const { language } = useLanguage();
//   const [post, setPost] = useState<any>(null);

//   useEffect(() => {
//     fetch("/api/home-post")
//       .then((res) => res.json())
//       .then(setPost)
//       .catch(console.error);
//   }, []);

//   if (!post) return null;

//   const { title, data } = post;
//   const bgImage = data?.background || PLACEHOLDER_IMAGE_URL;

//   return (
//     <div className="relative min-h-screen flex flex-col items-center justify-start overflow-hidden bg-gray-100">
//       {/* Background */}
//       <div
//         className="absolute inset-0 bg-cover bg-center"
//         style={{ backgroundImage: `url(${bgImage})` }}
//       >
//         <div className="absolute inset-0 bg-black/50" />
//       </div>

//       {/* Content */}
//       <div className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-36 max-w-5xl w-full">
//         <p className="text-lg md:text-2xl text-white mb-4">{data.subtitle}</p>

//         <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">{title}</h1>

//         <p className="text-base md:text-lg text-white mb-10">{data.description}</p>

//         {data.cta && (
//           <a
//             href={data.cta.url}
//             className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl shadow-xl transition"
//           >
//             {data.cta.label}
//           </a>
//         )}
//       </div>

//       {/* Review / Stats */}
//       {data.review && data.review.length > 0 && (
//         <div className="absolute bottom-0 w-full max-w-6xl mx-auto px-6 py-6">
//           <div className="border-t-4 border-white"></div>
//           <div className="flex flex-col sm:flex-row justify-around items-center text-white rounded-xl py-4">
//             {data.review.map((item, idx) => (
//               <div key={idx} className="flex flex-col items-center mx-4">
//                 <p className="text-2xl md:text-3xl font-extrabold">{item.number}</p>
//                 <p className="text-sm md:text-base uppercase tracking-widest">{item.title}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
