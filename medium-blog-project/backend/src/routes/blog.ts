import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import {
  createblogInput,
  updateBlogInput,
} from "@vamshimuluguri/medium-proj-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("authorization") || "";
  const user = await verify(authHeader, c.env.JWT_SECRET);
  if (user) {
    c.set("userId", user.id);
    await next();
  } else {
    c.status(403);
    return c.json({
      message: "Your not logged in",
    });
  }
});

// blogRouter.use("/*", async (c, next) => {
//   const header = c.req.header("authorization") || "";
//   const token = header.split(" ")[1];

//   try {
//     const response = await verify(token, c.env.JWT_SECRET);
//     if (response.id) {
//       c.set("userId", response.id);
//       await next();
//     } else {
//       c.status(403);
//       return c.json({ error: "unauthorized" });
//     }
//   } catch (e) {
//     c.status(403);
//     return c.json({ error: "unauthorized" });
//   }
// });

blogRouter.post("/", async (c) => {
  const body = await c.req.json();

  const { success } = createblogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ msg: "Incorrect Inputs" });
  }
  const authorId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.blog.create({
    data: {
      title: body.title,
      content: body.content,
      authorId: Number(authorId),
    },
  });
  return c.json({
    id: post.id,
  });
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();

  const { success } = updateBlogInput.safeParse(body);

  if (!success) {
    c.status(411);
    return c.json({ msg: "Incorrect Inputs" });
  }
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const post = await prisma.blog.update({
    where: {
      id: body.id,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });
  return c.json({
    id: post.id,
  });
});

// Todo: pagination of top 5 posts

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const posts = await prisma.blog.findMany({
      select: {
        content: true,
        title: true,
        id: true,
        author: { select: { name: true } },
      },
    });

    return c.json({
      posts,
    });
  } catch (err) {
    c.status(411);
    console.log(err);

    return c.json({
      msg: "Error while fetching",
    });
  }
});

blogRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const post = await prisma.blog.findFirst({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        title: true,
        content: true,

        author: {
          select: {
            name: true,
          },
        },
      },
    });
    return c.json({
      post,
    });
  } catch (e) {
    c.status(411);
    return c.json({
      msg: "Error while fetching",
    });
  }
});
