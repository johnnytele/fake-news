"use client"

import { useState } from "react";
import Grid from '@mui/material/Grid2'
import { Button} from "@/components/ui/button"
import {Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader } from 'lucide-react';


export default function Home() {

  const [article, setArticle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState("");

  const generateArticle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/articleGen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          headline: document.getElementById("article-title").value,
          fact1: document.getElementById("fact-1").value,
          fact2: document.getElementById("fact-2").value,
          fact3: document.getElementById("fact-3").value,
        }),
      });

      const data = await response.json();
      console.log(data.article);
      setUrl(data.article);
      setArticle(data.article);
    } catch (error) {
      console.error("Error generating article:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Grid container spacing={3} sx={{ marginX: 20, marginY: 10, padding: 4, flexDirection: 'column', textAlign: 'center'}}>
        <Grid item>
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
            News, but just what you want it to say
          </h1>
          <p className="leading-7 [&:not(:first-child)]:mt-6">
            Fill out the form to generate a news article with the facts you want to see
          </p>
        </Grid>

        <Grid item >
          <Label className="mt-6">Article Title</Label>
          <Input id="article-title" placeholder="Article Title" className="mt-2" />
          <Label className="mt-6">Fact 1:</Label>
          <Input id="fact-1" placeholder="Fact 1" className="mt-2" />
          <Label className="mt-6">Fact 2:</Label>
          <Input id="fact-2" placeholder="Fact 2" className="mt-2" />
          <Label className="mt-6">Fact 3:</Label>
          <Input id="fact-3" placeholder="Fact 3" className="mt-2" />

          {url == "" ? 
            <Button className="mt-6" disabled={isLoading} onClick={generateArticle} >
              {isLoading ? "Generating..." : "Generate"  }
              {isLoading && <Loader className=" animate-spin" />}
            </Button> 
          : 
          <a href={`/article/${url}`}>
          <Button className="mt-6" disabled={isLoading} >
            Article Link!
          </Button>
          </a>
          }


        </Grid>



      </Grid>
    </div>
  );
}
