[TOC]



# Creating and Hosting a Personal Site on GitHub

Website Address: 

​			http://jmcglone.com/guides/github-pages/

## Why using Git and Github to create personal website

- simplicity

- good performance and reliability
- no databases
- hosting to be free or really cheap
- a custom domain
- the ability to work on my site from anywhere if needed
- to use open source tools supported by an active development community
- to get up and running quickly
- to have version control on my website, preferably Git
- to be able to share my code so others can easily re-use it

## Other resources May be useful for me to create the website

Get Started With GitHub Pages (Plus Bonus Jekyll):

​							https://24ways.org/2013/get-started-with-github-pages/

A guide to using: Github Pages:

​							https://www.thinkful.com/learn/a-guide-to-using-github-pages/

Github Pages:
							https://pages.github.com/

## What is Git, GitHub, and GitHub Pages?

Git is what you **do locally on your own computer** and GitHub is the place where all this gets stored **publicly on a server**.

### Git

[Git](http://git-scm.com/) is a version control system that tracks changes to files in a project over time.

With Git, the flow is multidirectional. Each change that is significant is marked as important in a version, and you proceed. If you need to get back to earlier stages, you can without any loss of data. Presently, Google Docs “revision history” or Wikipedia’s “edit history” work in this sort of fashion. Git is just a lot more detailed and can get a lot more complex if needed..

Git Tutorial:

​							https://docs.github.com/en/github/getting-started-with-github/quickstart/set-up-git

### Github

GitHub is a web hosting service for the source code of software and web development projects (or other text based projects) that use Git. In many cases, most of the code is publicly available, enabling developers to easily investigate, collaborate, download, use, improve, and remix that code. The container for the code of a specific project is called a **repository**.

There are thousands of really cool and exciting repositories on GitHub, with new ones added every day. Some examples of popular software development projects that make their code available on GitHub include:

- [Twitter Bootstrap](https://github.com/twbs/bootstrap), an extremely popular front-end framework for mobile first websites, created by developers at Twitter.
- [HTML5 Boilerplate](https://github.com/h5bp/html5-boilerplate), a front-end template for quickly building websites,
- The JavaScript Visualization Library [D3](https://github.com/mbostock/d3)
- [Ruby on Rails](https://github.com/rails/rails), the open-source web framework built on Ruby.

### GitHub Pages

GitHub Pages are public webpages hosted for free through GitHub. GitHub users can create and host both personal websites (one allowed per user) and websites related to specific GitHub projects. 

## Getting Started with GitHub Pages

1. Create a repository 

2. Name your repository `username.github.io`, replacing `username` with your GitHub username. Be sure it is public and go ahead and tell GitHub to create a `README` file upon generating the repo.

3. Create an `index.html` page by clicking the plus icon next to your repository name and typing the file name directly in the input box that appears.

   ```
   <!DOCTYPE html>
   <html>
   	<head>
   		<title>Hank Quinlan, Horrible Cop</title>
   	</head>
   	<body>
   		<nav>
       		<ul>
           		<li><a href="/">Home</a></li>
   	        	<li><a href="/about">About</a></li>
           		<li><a href="/cv">CV</a></li>
           		<li><a href="/blog">Blog</a></li>
       		</ul>
   		</nav>
   		<div class="container">
       		<div class="blurb">
           		<h1>Hi there, I'm Hank Quinlan!</h1>
   				<p>I'm best known as the horrible cop from <em>A Touch of Evil</em> Don't trust me. <a href="/about">Read more about my life...</a></p>
       		</div><!-- /.blurb -->
   		</div><!-- /.container -->
   		<footer>
       		<ul>
           		<li><a href="mailto:hankquinlanhub@gmail.com">email</a></li>
           		<li><a href="https://github.com/hankquinlan">github.com/hankquinlan</a></li>
   			</ul>
   		</footer>
   	</body>
   </html>
   ```

5. To style the content go back to your repository home and create a new file named `css/main.css`. The `css/` before the filename will automatically create a subdirectory called `css`. Pretty neat.

   ```
   body {
       margin: 60px auto;
       width: 70%;
   }
   nav ul, footer ul {
       font-family:'Helvetica', 'Arial', 'Sans-Serif';
       padding: 0px;
       list-style: none;
       font-weight: bold;
   }
   nav ul li, footer ul li {
       display: inline;
       margin-right: 20px;
   }
   a {
       text-decoration: none;
       color: #999;
   }
   a:hover {
       text-decoration: underline;
   }
   h1 {
       font-size: 3em;
       font-family:'Helvetica', 'Arial', 'Sans-Serif';
   }
   p {
       font-size: 1.5em;
       line-height: 1.4em;
       color: #333;
   }
   footer {
       border-top: 1px solid #d5d5d5;
       font-size: .8em;
   }
   
   ul.posts { 
       margin: 20px auto 40px; 
       font-size: 1.5em;
   }
   
   ul.posts li {
       list-style: none;
   }
   ```

6. Link to your CSS file inside your HTML document's `<head>`. Go back to `index.html` and select the "Edit" button.

   Add a link to `main.css` (new markup is in bold):

   ```
   <!DOCTYPE html>
   <html>
   	<head>
   		<title>Hank Quinlan, Horrible Cop</title>
   		<!-- link to main stylesheet -->
   		<link rel="stylesheet" type="text/css" href="/css/main.css">
   	</head>
   	<body>
   		<nav>
       		<ul>
           		<li><a href="/">Home</a></li>
   	        	<li><a href="/about">About</a></li>
           		<li><a href="/cv">CV</a></li>
           		<li><a href="/blog">Blog</a></li>
       		</ul>
   		</nav>
   		<div class="container">
       		<div class="blurb">
           		<h1>Hi there, I'm Hank Quinlan!</h1>
   				<p>I'm best known as the horrible cop from <em>A Touch of Evil</em> Don't trust me. <a href="/about">Read more about my life...</a></p>
       		</div><!-- /.blurb -->
   		</div><!-- /.container -->
   		<footer>
       		<ul>
           		<li><a href="mailto:hankquinlanhub@gmail.com">email</a></li>
           		<li><a href="https://github.com/hankquinlan">github.com/hankquinlan</a></li>
   			</ul>
   		</footer>
   	</body>
   </html>
   ```

## Using Jekyll with GitHub Pages

Like GitHub Pages, Jekyll is self-aware, so if you add folders and files following specific naming conventions, when you commit to GitHub, Jekyll will magically build your website.

**While I recommend setting up Jekyll on your own computer so you can edit and preview your site locally, and when ready, push those changes to your GitHub repo, we're not going to do that**. Instead, to quickly get a handle on how Jekyll works, we're going to build it into our GitHub repo using the GitHub web interface.

### What is Jekyll?

Jekyll is a very powerful static site generator. In some senses, it is a throwback to the days of static HTML before databases were used to store website content. For simple sites without complex architectures, like a personal website, this is a huge plus. **When used alongside GitHub, Jekyll will automatically re-generate all the HTML pages for your website each time you commit a file.**

Jekyll makes managing your website easier because it depends on templates. **Templates (or layouts in Jekyll nomenclature) are your best friend when using a static site generator.**

Instead of repeating the same navigation markup on every page I create, which I'd have to edit on every page if I add, remove, or change the location of navigation item, **I can create what Jekyll calls a layout that gets used on all my pages.** 

### Setting Up Jekyll on github.com

7. Create a `.gitignore` file. This file tells Git to ignore the `_site` directory that Jekyll automatically generates each time you commit. Because this directory and all the files inside are written each time you commit, you do not want this directory under version control.

   Add this simple line to the file:

   ```
   	_site/
   ```

8. Create a `_config.yml` file that tells Jekyll some basics about your project. In this example, we're telling Jekyll the name of our site and what version of Markdown we'd like to use:

   ```
   name: Hank Quinlan, Horrible Cop
   	markdown: kramdown
   ```

9. Make a `_layouts` directory, and create file inside it called `default.html`. (Remember, you can make directories while making new files. See the [`main.css` step](http://jmcglone.com/guides/github-pages/#css) if you forgot.)

   This is our main layout that will contain repeated elements like our `<head>` and `<footer>`. Now we won't have to repeat that markup on every single page we create, **making maintenance of our site much easier**. So let's move those elements from `index.html` into `default.html` to get something that looks like this in the end:

   ```
   <!DOCTYPE html>
   	<html>
   		<head>
   			<title>{{ page.title }}</title>
   			<!-- link to main stylesheet -->
   			<link rel="stylesheet" type="text/css" href="/css/main.css">
   		</head>
   		<body>
   			<nav>
   	    		<ul>
   	        		<li><a href="/">Home</a></li>
   		        	<li><a href="/about">About</a></li>
   	        		<li><a href="/cv">CV</a></li>
   	        		<li><a href="/blog">Blog</a></li>
   	    		</ul>
   			</nav>
   			<div class="container">
   			
   			{{ content }}
   			
   			</div><!-- /.container -->
   			<footer>
   	    		<ul>
   	        		<li><a href="mailto:hankquinlanhub@gmail.com">email</a></li>
   	        		<li><a href="https://github.com/hankquinlan">github.com/hankquinlan</a></li>
   				</ul>
   			</footer>
   		</body>
   	</html>
   ```

   Take note of the `{{ page.title }}` and `{{ content }}` tags in there. They're what Jekyll calls **liquid tags**, and **these are used to inject content into the final web page**. More on this in a bit.

   10. Now update your `index.html` to use your default layout. Replace the entire contents of that file with this:

       ```
       ---
       layout: default
       title: Hank Quinlan, Horrible Cop
       ---
       <div class="blurb">
       	<h1>Hi there, I'm Hank Quinlan!</h1>
       	<p>I'm best known as the horrible cop from <em>A Touch of Evil</em> Don't trust me. <a href="/about">Read more about my life...</a></p>
       </div><!-- /.blurb -->
       ```

       Notice the **plain text at the top of the file.** Jekyll calls this **the Front-matter**. Any file on your site that contains this will be processed by Jekyll. Every time you commit a file that specifies `layout: default` at the top, Jekyll will magically generate the full HTML document by replacing `{{ content }}` in `_layouts/default.html` with the contents of the committed file. Awesome!

   ## Setting up a Blog

   A Jekyll-based blog uses the same conventions that we've familiarized ourselves with in the previous steps, but takes things further by adding a few more for us to follow. Jekyll is very flexible allowing you to extend your site as you wish, but in this guide we're only going to cover the basics: creating a post, making a page to list our posts, creating a custom permalink for posts, and creating an RSS feed for the blog.

   We'll want to create a new layout for our blog posts called `post.html` and a folder to store each individual post called `_posts/`.

   11. Start by creating the layout. Create a file named `post.html` in your `_layouts` folder. Notice the post layout uses the default layout as it's base, and adds a couple new liquid tags to print the title of the post and date:

       ```
       ---
       layout: default
       ---
       <h1>{{ page.title }}</h1>
       <p class="meta">{{ page.date | date_to_string }}</p>
       
       <div class="post">
         {{ content }}
       </div>
       ```

   12. Make a `_posts/` directory where we'll store our blog posts. Inside that folder will be our first post. **Jekyll is very strict with how these files are named,** so pay attention. It must follow the convention `YYYY-MM-DD-title-of-my-post.md`. This file name gets translated into the permalink for the blog post. So in this example, we'll create a file named `2014-04-30-hank-quinlan-site-launched.md`:

       ```
       ---
       layout: post
       title: "Hank Quinlan, Horrible Cop, Launches Site"
       date: 2014-04-30
       ---
       
       Well. Finally got around to putting this old website together. Neat thing about it - powered by [Jekyll](http://jekyllrb.com) and I can use Markdown to author my posts. It actually is a lot easier than I thought it was going to be.
       ```

       After committing the new post, navigate to [http://username.github.io/YYYY/MM/DD/name-of-your-post](http://jmcglone.com/guides/github-pages/#) to view it.

       https://glenhank.github.io/2014/04/30/hank-quinlan-site-launched  like this

       

       All this is great, but your readers won't always know the exact URLs of your posts. So next we need to create a page on our site that lists each post's title and hyperlink. **You could create this list on your homepage or alternatively, create a blog subpage that collects all of your posts.** We're going to do the latter.

   13. Create a `blog` directory and create a file named `index.html` inside it. To list each post, we'll use a foreach loop to create an unordered list of our blog posts:

       ```
       ---
       layout: default
       title: Hank Quinlan's Blog
       ---
       	<h1>{{ page.title }}</h1>
       	<ul class="posts">
       
       	  {% for post in site.posts %}
       	    <li><span>{{ post.date | date_to_string }}</span> » <a href="{{ post.url }}" title="{{ post.title }}">{{ post.title }}</a></li>
       	  {% endfor %}
       	</ul>
       ```

## Customizing Your Blog

You may have noticed that the URL of your blog post does not include the blog directory in it. In Jekyll we can control the structure of our permalinks by editing the `_config.yml` file we created in Step 8. So let's change our permalink structure to include the blog directory.

14. Edit the `_config.yml` file. Add the following line at the end of the file: ？？？？？？

    ```
    permalink: /blog/:year/:month/:day/:title
    ```

15. RRS Inside your `blog/` directory create a file and name it `atom.xml`. Add this to file: ?????

    Now you can include a link to your RSS feed somewhere on your site for users to subscribe to your blog in their feed aggregator of choice. Navigate to [http://username.github.io/blog/atom.xml](http://jmcglone.com/guides/github-pages/#) to view your feed.

16. You're almost done! Don't forget to create and commit your `about/index.html` and `cv/index.html` pages. Since I'm sure you've got the hang of things now, I'll back off and let you get these pages finished on your own.
17. Before going any further, take the time to [setup Git](https://help.github.com/articles/set-up-git) and [Jekyll](http://jekyllrb.com/docs/installation/) on your own computer. This tutorial is all about Git in the web browser, so really it's only the half way point. **You're going to have to do this if you want to be able to upload image or PDF files to your GitHub repo.** GitHub's tutorials and desktop application make local setup easy, and now that you know many of Git and GitHub's basic concepts, you should be able to get this going. Go do it!

## Next Steps

Hopefully this guide has given you the confidence to do many other things with Git, GitHub, Jekyll, and your website or blog. You could go in many different directions at this point, as I'm sure you've already started thinking about, but here are a few other things I think would be worth your time: