import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** The ordinary answer path: Markdown, without a component-card wrapper. */
export default function MarkdownPart({ text }: { text: string }) {
  return (
    <div className="text-base leading-7 [text-wrap:pretty] [&_p+p]:mt-4 [&_strong]:font-medium [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_a]:text-brand-link [&_a]:underline [&_a]:underline-offset-4 [&_a]:break-words [&_code]:break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        unwrapDisallowed
        allowedElements={[
          "p",
          "strong",
          "em",
          "ul",
          "ol",
          "li",
          "blockquote",
          "code",
          "a",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "br",
        ]}
        urlTransform={(url) => {
          try {
            const parsed = new URL(url);
            return parsed.protocol === "https:" &&
              !parsed.username &&
              !parsed.password
              ? parsed.href
              : "";
          } catch {
            return "";
          }
        }}
        components={{
          a: ({ children, href }) =>
            href ? (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <>{children}</>
            ),
          table: ({ children }) => (
            <div className="max-w-full overflow-x-auto">
              <table className="w-full text-left text-sm leading-6 [&_th]:px-2 [&_th]:py-3 [&_th]:font-medium [&_th]:text-muted-foreground [&_td]:px-2 [&_td]:py-3 [&_tr]:shadow-[0_1px_0_var(--border)] [&_th:first-child]:pl-0 [&_td:first-child]:pl-0 [&_th:last-child]:pr-0 [&_td:last-child]:pr-0">
                {children}
              </table>
            </div>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
