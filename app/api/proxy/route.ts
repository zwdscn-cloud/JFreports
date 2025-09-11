import { NextRequest, NextResponse } from 'next/server';

// 配置动态路由
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    console.error('代理请求失败: URL参数缺失');
    return NextResponse.json({ error: 'URL参数缺失' }, { status: 400 });
  }

  try {
    // 验证URL格式
    let targetUrl;
    try {
      targetUrl = new URL(url);
    } catch (urlError) {
      console.error('代理请求失败: URL格式错误', url, urlError);
      return NextResponse.json({ 
        error: 'URL格式错误',
        details: '请检查URL是否正确',
        url: url
      }, { status: 400 });
    }
    
    // 允许HTTP和HTTPS协议
    if (targetUrl.protocol !== 'https:' && targetUrl.protocol !== 'http:') {
      console.error('代理请求失败: 不支持的协议', targetUrl.protocol);
      return NextResponse.json({ 
        error: '只支持HTTP和HTTPS协议',
        details: `当前协议: ${targetUrl.protocol}`,
        url: url
      }, { status: 400 });
    }

    console.log(`开始代理请求: ${url}`);
    console.log(`目标域名: ${targetUrl.hostname}`);
    console.log(`目标端口: ${targetUrl.port || (targetUrl.protocol === 'https:' ? '443' : '80')}`);

    // 获取3D模型文件
    const fetchOptions = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Origin': request.headers.get('origin') || '*',
        'Referer': targetUrl.origin,
      },
      // 增加超时时间，特别是对大文件
      signal: AbortSignal.timeout(120000), // 120秒超时
      // 添加重定向处理
      redirect: 'follow',
    };

    console.log('发送fetch请求...');
    
    // 添加重试机制
    let response;
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`尝试第 ${attempt} 次请求...`);
        response = await fetch(url, fetchOptions);
        console.log(`收到响应: ${response.status} ${response.statusText}`);
        break; // 成功则跳出循环
      } catch (fetchError: any) {
        lastError = fetchError;
        console.warn(`第 ${attempt} 次请求失败:`, fetchError.message);
        
        if (attempt < maxRetries) {
          // 等待一段时间后重试
          const delay = Math.pow(2, attempt) * 1000; // 指数退避
          console.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    if (!response) {
      throw lastError || new Error('所有重试都失败了');
    }

    if (!response.ok) {
      console.error(`代理请求失败: ${response.status} ${response.statusText} for URL: ${url}`);
      console.error(`响应头:`, Object.fromEntries(response.headers.entries()));
      
      // 提供更详细的错误信息
      let errorMessage = `目标服务器返回错误: ${response.status} ${response.statusText}`;
      let suggestions = [];
      
      if (response.status === 404) {
        errorMessage = `模型文件不存在 (404): ${url}`;
        suggestions.push('请检查URL是否正确');
        suggestions.push('确认文件是否已被删除或移动');
        suggestions.push('验证服务器是否正常运行');
      } else if (response.status === 403) {
        errorMessage = `访问被拒绝 (403): ${url}`;
        suggestions.push('服务器可能设置了访问限制');
        suggestions.push('可能需要认证或特殊权限');
        suggestions.push('尝试使用其他模型文件');
      } else if (response.status === 500) {
        errorMessage = `服务器内部错误 (500): ${url}`;
        suggestions.push('目标服务器出现问题');
        suggestions.push('请稍后重试');
        suggestions.push('或联系文件提供方');
      } else if (response.status >= 500) {
        errorMessage = `服务器错误 (${response.status}): ${url}`;
        suggestions.push('目标服务器暂时不可用');
        suggestions.push('请稍后重试');
        suggestions.push('或使用其他模型文件');
      } else if (response.status >= 400) {
        errorMessage = `客户端错误 (${response.status}): ${url}`;
        suggestions.push('请求参数或URL格式可能有问题');
        suggestions.push('检查URL是否正确');
        suggestions.push('确认文件格式为GLB/GLTF');
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: `无法访问: ${url}`,
          status: response.status,
          statusText: response.statusText,
          suggestions: suggestions,
          url: url
        },
        { 
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // 检查文件大小
    const contentLength = response.headers.get('Content-Length');
    const fileSize = contentLength ? parseInt(contentLength, 10) : 0;
    console.log(`文件大小: ${fileSize} bytes (${(fileSize / 1024 / 1024).toFixed(2)} MB)`);

    // 对于大文件（>10MB），使用流式传输
    if (fileSize > 10 * 1024 * 1024) {
      console.log('检测到大文件，使用流式传输...');
      
      // 设置CORS头
      const headers = new Headers();
      headers.set('Access-Control-Allow-Origin', '*');
      headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      headers.set('Access-Control-Allow-Headers', '*');
      headers.set('Access-Control-Max-Age', '86400'); // 24小时缓存
      headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
      if (contentLength) {
        headers.set('Content-Length', contentLength);
      }
      headers.set('Cache-Control', 'public, max-age=3600'); // 缓存1小时

      console.log('返回流式响应');
      return new NextResponse(response.body, {
        status: 200,
        headers,
      });
    }

    // 对于小文件，使用缓冲传输
    console.log('开始下载文件内容...');
    const buffer = await response.arrayBuffer();
    console.log(`文件下载完成: ${buffer.byteLength} bytes`);
    
    // 验证文件大小
    if (buffer.byteLength === 0) {
      console.error('代理请求失败: 文件内容为空');
      return NextResponse.json(
        { 
          error: '文件内容为空',
          details: '下载的文件没有任何内容',
          url: url
        },
        { 
          status: 502,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json',
          }
        }
      );
    }
    
    console.log(`代理请求成功: ${url}, 文件大小: ${buffer.byteLength} bytes`);
    
    // 设置CORS头 - 修复CORS问题
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('Access-Control-Max-Age', '86400'); // 24小时缓存
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('Content-Length', buffer.byteLength.toString());
    
    // 添加缓存控制
    headers.set('Cache-Control', 'public, max-age=3600'); // 缓存1小时

    console.log('返回成功响应');
    return new NextResponse(buffer, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('代理请求失败:', error);
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    console.error('错误堆栈:', error.stack);
    
    let errorMessage = '代理请求失败';
    let suggestions = [];
    
    if (error.name === 'AbortError') {
      errorMessage = '请求超时';
      suggestions.push('请检查网络连接或稍后重试');
      suggestions.push('目标服务器响应较慢');
      suggestions.push('尝试使用较小的模型文件');
    } else if (error.message?.includes('fetch')) {
      errorMessage = '网络连接失败';
      suggestions.push('请检查URL是否正确或网络是否正常');
      suggestions.push('检查防火墙设置');
      suggestions.push('尝试使用其他网络环境');
    } else if (error.message?.includes('ENOTFOUND')) {
      errorMessage = '域名解析失败';
      suggestions.push('请检查URL是否正确');
      suggestions.push('确认域名是否存在');
      suggestions.push('检查DNS设置');
    } else if (error.message?.includes('ECONNREFUSED')) {
      errorMessage = '连接被拒绝';
      suggestions.push('目标服务器可能不可用');
      suggestions.push('服务器可能已关闭或端口被阻止');
      suggestions.push('尝试使用其他模型文件');
    } else if (error.message?.includes('CORS') || error.message?.includes('cross-origin')) {
      errorMessage = '跨域访问被阻止';
      suggestions.push('正在尝试其他加载方式');
      suggestions.push('建议使用支持CORS的URL');
      suggestions.push('或联系文件提供方启用CORS');
    } else if (error.message?.includes('timeout')) {
      errorMessage = '请求超时';
      suggestions.push('网络连接较慢，请稍后重试');
      suggestions.push('或检查文件大小是否过大');
    } else {
      errorMessage = '未知错误';
      suggestions.push('请检查URL格式是否正确');
      suggestions.push('确认文件格式为GLB/GLTF');
      suggestions.push('尝试使用官方示例模型');
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        suggestions: suggestions,
        url: url,
        errorType: error.constructor.name
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400', // 24小时缓存
    },
  });
}