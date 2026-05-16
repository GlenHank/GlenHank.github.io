# Blog Workflow

This site is designed for GitHub Pages. There is no CMS and no build step.

## Publish A Post

1. Open `data/posts.json` on GitHub.
2. Add a new post object at the top of the `posts` array.
3. Upload any images to `assets/blog/`.
4. Set the post `image` field to the relative image path, for example `assets/blog/solder-joint.jpg`.
5. Commit the change to `main`.

GitHub Pages will publish the updated homepage after the commit.

## Post Shape

```json
{
  "id": "short-lowercase-slug",
  "title": "Post title",
  "tag": "Microstructure",
  "date": "2026-05-17",
  "excerpt": "One short sentence for the homepage card.",
  "body": "Markdown-like text for the post body.",
  "image": "assets/blog/optional-cover.jpg"
}
```

The front end supports paragraphs, headings, simple bullet lists, links, inline code, bold, italic, and standalone markdown images.
