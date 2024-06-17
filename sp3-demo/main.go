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
        // 获取请求的来源
		origin := c.Request.Header.Get("Origin")

		// 允许的来源列表
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://127.0.0.1:5001",
		}

        // 检查请求的来源是否在允许的列表中
		allowed := false
		for _, o := range allowedOrigins {
			if origin == o {
				allowed = true
				break
			}
		}

        if allowed {
            c.Writer.Header().Set("Access-Control-Allow-Origin", origin)
            c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
            c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
            c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        }
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

        
        // 从响应体中获取数据
        result := resp.Result().(*map[string]interface{})
        // 构建返回的JSON数据
        responseData := gin.H{"message": "app3 Login Success"}
        for k, v := range *result {
            responseData[k] = v
        }

		// 从响应头中获取Cookie
		cookies := resp.Cookies()

		// 将SSO服务器返回的Cookie设置到当前响应中
		for _, cookie := range cookies {
			http.SetCookie(c.Writer, &http.Cookie{
				Name:     cookie.Name,
				Value:    cookie.Value,
				Path:     "/",
				Domain:   "127.0.0.1",
				Expires:  cookie.Expires,
				Secure:   cookie.Secure,
				HttpOnly: cookie.HttpOnly,
			})
		}

        c.JSON(http.StatusOK, responseData)
	})

	r.POST("/logout", func(c * gin.Context) {
		client := resty.New()

        // 从cookie中获取refresh_token
        refreshToken, err := c.Cookie("refresh_token")
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
            return
        }

        // 向SSO服务器发送请求以验证token
        resp, err := client.R().
            SetHeader("Cookie", "refresh_token="+refreshToken).
            SetHeader("Content-Type", "application/json").
			SetBody(map[string]string{"appid": "app3"}).
            SetResult(map[string]interface{}{}).
            Post("http://localhost:3000/logout")

        if err != nil || resp.StatusCode() != http.StatusOK {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
            return
        }

		c.SetCookie("refresh_token", "", -1, "/", "127.0.0.1", false, true)
		c.JSON(http.StatusOK, gin.H{"message": "app3 Logged out"})
	})

    r.POST("/refresh-token", func(c * gin.Context) {
		client := resty.New()

        // 从cookie中获取refresh_token
        refreshToken, err := c.Cookie("refresh_token")
        if err != nil {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
            return
        }

        // 向SSO服务器发送请求以验证token
        resp, err := client.R().
            SetHeader("Cookie", "refresh_token="+refreshToken).
            SetHeader("Content-Type", "application/json").
            SetResult(map[string]interface{}{}).
            Post("http://localhost:3000/refresh-token")

        if err != nil || resp.StatusCode() != http.StatusOK {
            c.JSON(http.StatusUnauthorized, gin.H{"message": "Not authenticated"})
            return
        }

        // 从响应体中获取数据
        result := resp.Result().(*map[string]interface{})
        // 构建返回的JSON数据
        responseData := gin.H{"message": "app3 Login Success"}
        for k, v := range *result {
            responseData[k] = v
        }

        c.JSON(http.StatusOK, responseData)
	})

    r.GET("/note", func(c *gin.Context) {
        client := resty.New()

        // 向SSO服务器发送请求以验证token		
        resp, err := client.R().
            SetHeader("Authorization", c.GetHeader("Authorization")).
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
