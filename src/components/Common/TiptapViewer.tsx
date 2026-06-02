"use client";

import { useEffect, useMemo } from "react";
import {
  EditorContent,
  useEditor,
  ReactNodeViewRenderer,
} from "@tiptap/react";
import type { JSONContent } from "@tiptap/core";
import { Node, mergeAttributes } from "@tiptap/core";
import ImageGalleryCarousel from "@/components/Common/ImageGalleryCarousel";
import StarterKit from "@tiptap/starter-kit";
import Details, {
  DetailsContent,
  DetailsSummary,
} from "@tiptap/extension-details";
import Emoji, { emojis } from "@tiptap/extension-emoji";
import Image from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import Link from "@tiptap/extension-link";
import Mathematics from "@tiptap/extension-mathematics";
import Mention from "@tiptap/extension-mention";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import {
  BackgroundColor,
  Color,
  FontFamily,
  FontSize,
  LineHeight,
  TextStyle,
} from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Youtube from "@tiptap/extension-youtube";

export type TiptapJsonContent = JSONContent;

type TiptapViewerProps = {
  content?: TiptapJsonContent | null;
  className?: string;
};

const emptyDocument: TiptapJsonContent = {
  type: "doc",
  content: [],
};

const supportedNodeTypes = new Set([
  "doc",
  "paragraph",
  "text",
  "hardBreak",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "taskList",
  "taskItem",
  "blockquote",
  "codeBlock",
  "horizontalRule",
  "image",
  "imageGallery",
  "youtube",
  "video",
  "iframe",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
  "details",
  "detailsSummary",
  "detailsContent",
  "mention",
  "emoji",
  "inlineMath",
  "blockMath",
]);

const supportedMarkTypes = new Set([
  "bold",
  "italic",
  "strike",
  "code",
  "link",
  "underline",
  "subscript",
  "superscript",
  "textStyle",
  "highlight",
]);

const inlineNodeTypes = new Set([
  "text",
  "hardBreak",
  "mention",
  "emoji",
  "inlineMath",
]);

const Video = Node.create({
  name: "video",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      poster: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [{ tag: "video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, {
        controls: "true",
        class: "mt-6 w-full rounded-md border border-slate-200 bg-black",
      }),
    ];
  },
});

const Iframe = Node.create({
  name: "iframe",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      title: {
        default: "Embedded content",
      },
      allow: {
        default:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
      },
      allowfullscreen: {
        default: "true",
      },
    };
  },

  parseHTML() {
    return [{ tag: "iframe" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        class:
          "mt-6 aspect-video w-full overflow-hidden rounded-md border border-slate-200",
      },
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
          class: "h-full w-full",
          allowFullScreen: "true",
        }),
      ],
    ];
  },
});

// Read-only counterpart of the dashboard's ImageGallery node. Renders the stored
// images as a horizontal scroll strip (one row, swipe/scroll left-right). The
// dashboard saves the node as { type: 'imageGallery', attrs: { images: [...] } }.
const ImageGallery = Node.create({
  name: "imageGallery",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      images: {
        default: [] as Array<{ src: string; alt?: string }>,
        parseHTML: (element) => {
          const raw = element.getAttribute("data-images");
          if (!raw) return [];
          try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        },
        renderHTML: (attributes) => ({
          "data-images": JSON.stringify(attributes.images ?? []),
        }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="image-gallery"]' }];
  },

  // Static fallback (used for SSR / non-React render paths). The interactive
  // Swiper carousel is provided by the node-view below.
  renderHTML({ node }) {
    const images: Array<{ src?: string; alt?: string }> = Array.isArray(
      node.attrs.images
    )
      ? node.attrs.images
      : [];

    return [
      "div",
      {
        "data-type": "image-gallery",
        class:
          "tiptap-gallery mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 p-2",
      },
      ...images
        .filter((image) => typeof image?.src === "string" && image.src)
        .map((image) => [
          "img",
          {
            src: image.src as string,
            alt: image.alt ?? "",
            loading: "lazy",
            class:
              "h-72 w-[20rem] flex-none snap-start rounded-md object-cover",
          },
        ]),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageGalleryCarousel);
  },
});

const viewerExtensions = [
  StarterKit,
  TextStyle,
  Color.configure({
    types: ["textStyle"],
  }),
  BackgroundColor.configure({
    types: ["textStyle"],
  }),
  FontFamily.configure({
    types: ["textStyle"],
  }),
  FontSize.configure({
    types: ["textStyle"],
  }),
  LineHeight.configure({
    types: ["textStyle"],
  }),
  Highlight.configure({
    multicolor: true,
  }),
  Image.configure({
    HTMLAttributes: {
      class: "mt-6 h-auto w-full rounded-md object-contain",
    },
  }),
  Link.configure({
    openOnClick: true,
    HTMLAttributes: {
      class: "break-words text-blue-700 underline",
      rel: "noopener noreferrer",
      target: "_blank",
    },
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: "mt-4 space-y-2 pl-0",
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: "flex gap-2",
    },
  }),
  Table.configure({
    resizable: false,
    HTMLAttributes: {
      class: "min-w-full border-collapse border border-slate-300",
    },
  }),
  TableRow,
  TableHeader.configure({
    HTMLAttributes: {
      class: "border border-slate-300 bg-slate-100 px-3 py-2 text-left",
    },
  }),
  TableCell.configure({
    HTMLAttributes: {
      class: "border border-slate-300 px-3 py-2",
    },
  }),
  Subscript,
  Superscript,
  TextAlign.configure({
    types: ["heading", "paragraph"],
  }),
  Typography,
  Underline,
  Details.configure({
    persist: true,
    HTMLAttributes: {
      class: "mt-4 rounded-md border border-slate-200 p-4",
    },
  }),
  DetailsSummary.configure({
    HTMLAttributes: {
      class: "cursor-pointer font-semibold text-slate-900",
    },
  }),
  DetailsContent.configure({
    HTMLAttributes: {
      class: "mt-3",
    },
  }),
  Mention.configure({
    HTMLAttributes: {
      class: "rounded bg-blue-50 px-1.5 py-0.5 text-blue-700",
    },
    renderText({ node }) {
      return `@${node.attrs.label ?? node.attrs.id ?? "mention"}`;
    },
    renderHTML({ node }) {
      return [
        "span",
        {
          "data-type": "mention",
          class: "rounded bg-blue-50 px-1.5 py-0.5 text-blue-700",
        },
        `@${node.attrs.label ?? node.attrs.id ?? "mention"}`,
      ];
    },
  }),
  Emoji.configure({
    emojis,
  }),
  Mathematics.configure({
    katexOptions: {
      throwOnError: false,
    },
  }),
  Youtube.configure({
    controls: true,
    nocookie: true,
    HTMLAttributes: {
      class: "mt-6 aspect-video w-full rounded-md border border-slate-200",
    },
  }),
  Video,
  Iframe,
  ImageGallery,
];

function getViewerClassName(className = "") {
  return [
    "tiptap-viewer max-w-none text-slate-700",
    "focus:outline-none",
    "[&_p]:mt-4 [&_p]:leading-relaxed",
    "[&_h1]:mt-8 [&_h1]:text-3xl [&_h1]:font-semibold [&_h1]:text-slate-900",
    "[&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-slate-900",
    "[&_h3]:mt-6 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-slate-900",
    "[&_h4]:mt-6 [&_h4]:text-lg [&_h4]:font-semibold [&_h4]:text-slate-900",
    "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6",
    "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6",
    "[&_li]:leading-relaxed",
    "[&_ul[data-type='taskList']]:list-none [&_ul[data-type='taskList']]:pl-0",
    "[&_li[data-type='taskItem']]:flex [&_li[data-type='taskItem']]:items-start [&_li[data-type='taskItem']]:gap-2",
    "[&_li[data-type='taskItem']_label]:mt-1",
    "[&_li[data-type='taskItem']_p]:mt-0",
    "[&_blockquote]:mt-4 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-500 [&_blockquote]:pl-4 [&_blockquote]:italic",
    "[&_pre]:mt-4 [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:bg-slate-900 [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-slate-100",
    "[&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_code]:text-[0.95em]",
    "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-slate-100",
    "[&_hr]:my-6 [&_hr]:border-slate-300",
    "[&_table]:mt-6",
    "[&_details_summary]:cursor-pointer",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

function hasContent(content?: TiptapJsonContent | null) {
  return Array.isArray(content?.content) && content.content.length > 0;
}

function normalizeMediaUrl(url: unknown) {
  if (typeof url !== "string") return url;

  if (url.startsWith("/https://") || url.startsWith("/http://")) {
    return url.slice(1);
  }

  return url;
}

function normalizeYoutubeUrl(url: unknown) {
  if (typeof url !== "string" || !url) return url;

  const cleanUrl = normalizeMediaUrl(url);

  if (typeof cleanUrl !== "string") return cleanUrl;

  if (cleanUrl.includes("youtube.com/watch")) {
    const videoId = cleanUrl.split("?")[1]?.split("&").find((item) => {
      return item.split("=")[0] === "v";
    })?.split("=")[1];

    return videoId ? `https://www.youtube.com/embed/${videoId}` : cleanUrl;
  }

  if (cleanUrl.includes("youtu.be/")) {
    const videoId = cleanUrl.split("youtu.be/")[1]?.split(/[?&/]/)[0] ?? "";
    return videoId ? `https://www.youtube.com/embed/${videoId}` : cleanUrl;
  }

  return cleanUrl;
}

function getStringAttr(attrs: Record<string, unknown> | undefined, key: string) {
  const value = attrs?.[key];
  return typeof value === "string" ? value.trim() : "";
}

function buildUnknownLinkNode(content: TiptapJsonContent) {
  const attrs = content.attrs ?? {};
  const href =
    getStringAttr(attrs, "href") ||
    getStringAttr(attrs, "url") ||
    getStringAttr(attrs, "src");

  if (!href) return [];

  const label =
    getStringAttr(attrs, "title") ||
    getStringAttr(attrs, "name") ||
    getStringAttr(attrs, "label") ||
    href;

  return [
    {
      type: "paragraph",
      content: [
        {
          type: "text",
          text: label,
          marks: [
            {
              type: "link",
              attrs: {
                href: normalizeMediaUrl(href),
                target: "_blank",
                rel: "noopener noreferrer",
              },
            },
          ],
        },
      ],
    },
  ];
}

function isInlineNode(content: TiptapJsonContent) {
  return inlineNodeTypes.has(content.type ?? "");
}

function sanitizeMarks(marks: TiptapJsonContent["marks"]) {
  return marks?.filter((mark) => supportedMarkTypes.has(mark.type ?? ""));
}

function sanitizeTiptapNodes(content: TiptapJsonContent): TiptapJsonContent[] {
  const type = content.type ?? "";

  if (type === "embed") {
    return sanitizeTiptapNodes({
      ...content,
      type: "iframe",
    });
  }

  if (!supportedNodeTypes.has(type)) {
    const children = (content.content ?? []).flatMap(sanitizeTiptapNodes);

    if (children.length > 0) {
      const onlyInlineChildren = children.every(isInlineNode);

      return onlyInlineChildren
        ? [
            {
              type: "paragraph",
              content: children,
            },
          ]
        : children;
    }

    return buildUnknownLinkNode(content);
  }

  const attrs = content.attrs ? { ...content.attrs } : undefined;
  const contentChildren = content.content?.flatMap(sanitizeTiptapNodes);

  if (attrs && (type === "image" || type === "video" || type === "iframe")) {
    attrs.src = normalizeMediaUrl(attrs.src);
  }

  // Gallery stores its images in attrs.images[]; normalize each src the same way.
  if (attrs && type === "imageGallery" && Array.isArray(attrs.images)) {
    attrs.images = attrs.images
      .filter(
        (image: unknown): image is { src: string; alt?: string } =>
          Boolean(image) &&
          typeof image === "object" &&
          typeof (image as { src?: unknown }).src === "string"
      )
      .map((image: { src: string; alt?: string }) => ({
        ...image,
        src: normalizeMediaUrl(image.src) as string,
      }));
  }

  if (attrs && type === "youtube") {
    attrs.src = normalizeYoutubeUrl(attrs.src);
  }

  return [{
    ...content,
    attrs,
    marks: sanitizeMarks(content.marks),
    content: contentChildren,
  }];
}

// If this node IS an image, or is a paragraph that wraps a single image,
// return the underlying image node. Used to find consecutive image runs
// even when each image sits in its own paragraph.
function extractImageNode(node: TiptapJsonContent): TiptapJsonContent | null {
  if (node?.type === "image" && typeof node.attrs?.src === "string") {
    return node;
  }
  if (
    (node?.type === "paragraph" || node?.type === "div") &&
    Array.isArray(node.content) &&
    node.content.length === 1 &&
    node.content[0]?.type === "image" &&
    typeof node.content[0]?.attrs?.src === "string"
  ) {
    return node.content[0];
  }
  return null;
}

// Walk an array of sibling nodes and replace any run of 2+ consecutive image
// nodes with a single synthetic imageGallery node — so they render as the
// Swiper carousel instead of stacked images. Recurses into children so nested
// runs (e.g. inside a list item) also collapse.
function groupConsecutiveImages(
  nodes: TiptapJsonContent[]
): TiptapJsonContent[] {
  const result: TiptapJsonContent[] = [];
  let imageRun: TiptapJsonContent[] = [];

  const flushRun = () => {
    if (imageRun.length === 0) return;
    if (imageRun.length === 1) {
      // Single image — leave as a normal image node.
      result.push(imageRun[0]);
    } else {
      // 2+ consecutive images — turn into one gallery.
      result.push({
        type: "imageGallery",
        attrs: {
          images: imageRun
            .map((img) => {
              const src =
                typeof img.attrs?.src === "string" ? img.attrs.src : "";
              const alt =
                typeof img.attrs?.alt === "string" ? img.attrs.alt : "";
              return alt ? { src, alt } : { src };
            })
            .filter((img) => img.src),
        },
      });
    }
    imageRun = [];
  };

  for (const node of nodes) {
    const innerImage = extractImageNode(node);
    if (innerImage) {
      imageRun.push(innerImage);
      continue;
    }

    flushRun();

    // Recurse into the node's content so nested runs also collapse.
    if (Array.isArray(node?.content) && node.content.length > 0) {
      result.push({
        ...node,
        content: groupConsecutiveImages(node.content),
      });
    } else {
      result.push(node);
    }
  }

  flushRun();
  return result;
}

function normalizeTiptapContent(content: TiptapJsonContent): TiptapJsonContent {
  const normalizedNodes = sanitizeTiptapNodes(content);
  const normalizedDoc = normalizedNodes[0] ?? emptyDocument;

  // Wrap loose nodes into a `doc` envelope so the grouping pass has a
  // consistent shape to work with.
  const baseDoc: TiptapJsonContent =
    normalizedDoc.type === "doc"
      ? normalizedDoc
      : { type: "doc", content: normalizedNodes };

  // Group consecutive image runs into imageGallery nodes so they render as
  // the Swiper carousel rather than stacking on top of each other.
  return {
    ...baseDoc,
    content: groupConsecutiveImages(baseDoc.content ?? []),
  };
}

export default function TiptapViewer({
  content,
  className = "",
}: TiptapViewerProps) {
  const viewerClassName = useMemo(
    () => getViewerClassName(className),
    [className]
  );

  const viewerContent = useMemo(
    () => normalizeTiptapContent(content ?? emptyDocument),
    [content]
  );

  const editor = useEditor({
    extensions: viewerExtensions,
    content: viewerContent,
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: viewerClassName,
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.commands.setContent(viewerContent);
  }, [editor, viewerContent]);

  useEffect(() => {
    if (!editor) return;

    editor.setOptions({
      editorProps: {
        attributes: {
          class: viewerClassName,
        },
      },
    });
  }, [editor, viewerClassName]);

  if (!editor || !hasContent(viewerContent)) {
    return null;
  }

  return <EditorContent editor={editor} />;
}
