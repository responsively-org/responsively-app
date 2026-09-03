# Troubleshooting Guide

## Common Installation Issues

### App won't install on Windows 10
**Problem**: Installation fails or gets blocked
**Solution**: 
- Temporarily disable Windows Defender during installation
- Try downloading the installer directly from the releases page
- Run installer as Administrator

### Dependencies fail to install
**Problem**: `yarn install` fails with errors
**Solution**:
- Clear node_modules: `rm -rf node_modules`
- Use legacy peer deps: `yarn install --legacy-peer-deps`
- Ensure you have Node.js 16+ installed

## Common Runtime Errors

### App crashes when visiting specific sites (like Twitter)
**Problem**: App crashes when navigating to certain websites
**Solution**:
- This is a known issue being worked on
- Temporary workaround: Avoid those specific sites in Responsively

### Blank screen with Next.js applications
**Problem**: Shows blank screen when loading local Next.js apps
**Solution**:
- Use your local IP address instead of localhost
- Example: Use `http://192.168.0.100:3000` instead of `http://localhost:3000`

## Performance Issues

### App runs slowly with multiple devices
**Problem**: Performance degrades with many device previews
**Solution**:
- Reduce the number of simultaneous device previews
- Close other memory-intensive applications
- Restart the app periodically
