"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth } from "@/firebase"
import { signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";


export default function ArticlesPage() {
    const [articles, setArticles] = useState([])
    const [user, setUser] = useState(null);
    const router = useRouter();

        useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login"); 
      }
    });
    return () => unsubscribe();
    }, [router]);
    
  const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
      };

    const fetchArticles = async () => {
        const resp = await fetch("http://localhost:5000/get-articles", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
        const data = await resp.json()
        setArticles(data)
        console.log(data)
    }

    const openArticle = async (uri, id) => {
        try {
            const uid = auth.currentUser.uid

            const resp = await fetch("http://localhost:5000/user-event", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    user_id: uid,
                    article_id: id,
                }),
            })
            const data = await resp.json()
            console.log(data)
            // if(data.status !== "event sent"){
            //     alert("Event not sent!")
            // }
            // else {
            //     alert("Event sent!")
            // }
        } catch (_) {
        } finally {
            window.open(uri, "_blank")
        }
    }

    
    useEffect(() => {
    if (user) {
        fetchArticles();
    }
    }, [user]);
    if (!user) return <p className="flex h-screen items-center justify-center text-muted-foreground">Loading...</p>;
    return (
        <div className="min-h-screen bg-muted/40">
            <div className="container mx-auto max-w-7xl p-6 md:p-8">

                <header className="flex items-center justify-between mb-8 pb-6 border-b">
                    <h1 className="text-3xl font-bold tracking-tight">Latest Articles</h1>
                    
                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline" 
                            onClick={() => router.push("articles/recommended")}
                        >
                            My Recommendations
                        </Button>

                        <Button onClick={handleLogout} variant="default">
                        Logout
                        </Button>
                    </div>
                </header>
                
                
                {articles.length === 0 ? (
                    <p className="text-muted-foreground text-center">No articles found.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article, idx) => (
                            <Card key={idx} className="flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:-translate-y-1">
                                
                                <div className="p-5">
                                    <h2 className="text-xl font-bold mb-2 line-clamp-2">
                                        <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                                            {article.title}
                                        </a>
                                    </h2>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{article.description}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {article.tags?.slice(0, 5).map((tag) => (
                                            <span key={tag} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-transparent bg-secondary text-secondary-foreground">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-auto text-xs text-muted-foreground p-5 pt-4 border-t space-y-3">
                                    <p className="flex items-center gap-1.5">
                                        📰 <span className="font-medium text-foreground">{article.source}</span>
                                    </p>
                                    <p className="flex items-center gap-1.5">
                                        📅{" "}
                                        {new Date(article.publishedAt).toLocaleString("en-IN", {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </p>

                                    <Button variant="link" size="sm" className="mt-2 w-auto p-0 h-auto font-semibold text-primary" onClick={() => openArticle(article.url, article.article_id)}>
                                        Read Full Article
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

