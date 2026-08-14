module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");

  eleventyConfig.addCollection("experienceList", (api) =>
    api
      .getFilteredByTag("experience")
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
  );

  eleventyConfig.addCollection("volunteerList", (api) =>
    api
      .getFilteredByTag("volunteer")
      .sort((a, b) => (a.data.order ?? 0) - (b.data.order ?? 0))
  );

  eleventyConfig.addCollection("pagesList", (api) =>
    api
      .getFilteredByTag("pages")
      .filter((p) => p.data.showInNav !== false)
      .sort((a, b) => (a.data.navOrder ?? 0) - (b.data.navOrder ?? 0))
  );

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "content/_data",
      output: "_site",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
