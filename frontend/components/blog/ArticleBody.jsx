// BlogPost.content is stored as plain text with paragraphs separated by a
// blank line, matching what the Django admin editor produces (see
// blog/models.py on the backend). A line starting with "## " is treated as
// a subheading. This keeps the frontend free of a markdown/HTML parser
// dependency while still giving articles some structure.
export default function ArticleBody({ content }) {
  if (!content) return null;

  const blocks = content.trim().split(/\n\s*\n/);

  return (
    <div className="font-display text-[1.15rem] leading-[1.8] text-ink">
      {blocks.map((block, i) => {
        const trimmed = block.trim();

        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={i}
              className="mb-4 mt-10 font-display text-2xl font-semibold text-ink first:mt-0"
            >
              {trimmed.slice(3)}
            </h2>
          );
        }

        return (
          <p key={i} className="mb-6 whitespace-pre-line">
            {trimmed}
          </p>
        );
      })}
    </div>
  );
}
