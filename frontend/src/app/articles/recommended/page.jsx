// app/articles/page.jsx
"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { auth } from "@/firebase"

export default function ArticlesPage() {
    const [articles, setArticles] = useState([])
    const [uid, setUid] = useState()

    auth.onAuthStateChanged((user) => {
        if (user) {
            setUid(user.uid)
        } else {
        }
    })

    const fetchArticles = async () => {
        try {
            const resp = await fetch("http://localhost:5000/recommendations/" + uid, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            })
            const data = await resp.json()
            setArticles(data)
            console.log(data)
        } catch (e) {
            console.log(e)
        }
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
        if (uid) fetchArticles()
    }, [uid])

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-6">Latest Articles</h1>

            {articles.length === 0 ? (
                <p className="text-muted-foreground">No articles found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article, idx) => (
                        <Card key={idx} className="p-5 flex flex-col justify-between hover:shadow-lg transition-shadow">
                            <div>
                                <h2 className="text-lg font-semibold mb-2">
                                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                        {article.title}
                                    </a>
                                </h2>

                                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{article.description}</p>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {article.tags?.slice(0, 5).map((tag) => (
                                        <span key={tag} className="text-xs bg-muted px-2 py-1 rounded-md">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-auto text-xs text-muted-foreground">
                                <p>
                                    📰 <span className="font-medium">{article.source}</span>
                                </p>
                                <p>
                                    📅{" "}
                                    {new Date(article.publishedAt).toLocaleString("en-IN", {
                                        dateStyle: "medium",
                                        timeStyle: "short",
                                    })}
                                </p>

                                <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => openArticle(article.url, article.article_id)}>
                                    Read Full Article
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
