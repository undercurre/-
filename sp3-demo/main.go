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
		var creds struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}

		if err := c.ShouldBindJSON(&creds); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid request"})
			return
		}

		client := resty.New()

        // 向SSO服务器发送请求以验证token
        resp, err := client.R().
            SetHeader("Content-Type", "application/json").
			SetBody(map[string]string{"username": creds.Username, "password": creds.Password, "appid": "app3"}).
            SetResult(map[string]interface{}{}).
            Post("http://localhost:3000/login")
		
		if err != nil || resp.StatusCode() != http.StatusOK {
			c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
			return
		}

		// 从响应头中获取Cookie
		cookies := resp.Cookies()

		// 将SSO服务器返回的Cookie设置到当前响应中
		for _, cookie := range cookies {
			http.SetCookie(c.Writer, &http.Cookie{
				Name:     cookie.Name,
				Value:    cookie.Value,
				Path:     cookie.Path,
				Domain:   cookie.Domain,
				Expires:  cookie.Expires,
				Secure:   cookie.Secure,
				HttpOnly: cookie.HttpOnly,
			})
		}

        c.JSON(http.StatusOK, gin.H{"message": "app3 Login Success"})
	})

	r.POST("/logout", func(c * gin.Context) {
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
			SetBody(map[string]string{"appid": "app3"}).
            SetResult(map[string]interface{}{}).
            Post("http://localhost:3000/logout")

        if err != nil || resp.StatusCode() != http.StatusOK {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
            return
        }

		c.SetCookie("sso_token", "", -1, "/", "127.0.0.1", false, true)
		c.JSON(http.StatusOK, gin.H{"message": "app3 Logged out"})
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
