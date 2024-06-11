package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
)

func main() {
    r := gin.Default()

    // 允许跨域请求
    r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(http.StatusNoContent)
            return
        }
        c.Next()
    })

	r.POST("/login", func(c * gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "App3 login"})
	})

	r.POST("/logout", func(c * gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "App3 logout"})
	})

    r.GET("/note", func(c *gin.Context) {
        client := resty.New()

        // 从cookie中获取sso_token
        ssoToken, err := c.Cookie("sso_token")
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
            return
        }

        // 向SSO服务器发送请求以验证token
        resp, err := client.R().
            SetHeader("Cookie", "sso_token="+ssoToken).
            SetHeader("Content-Type", "application/json").
            SetResult(map[string]interface{}{}).
            Get("http://localhost:3000/verify")

        if err != nil || resp.StatusCode() != http.StatusOK {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
            return
        }

        result := resp.Result().(*map[string]interface{})
        user := (*result)["username"]

        c.JSON(http.StatusOK, gin.H{"message": "Note data", "user": user})
    })

    r.Run(":6000")
}
