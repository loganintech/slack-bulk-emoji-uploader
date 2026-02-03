# Slack Bulk Emoji Uploader

A ViolentMonkey/Tampermonkey userscript that adds bulk emoji upload functionality to Slack's emoji customization page.

![Bulk Emoji Upload Modal](screenshot.png)

## Features

- **Bulk upload** - Select multiple emoji images at once via drag & drop or file browser
- **Rename before upload** - Edit emoji names before confirming, with live validation
- **Auto-sanitization** - File names are automatically converted to valid Slack emoji format
- **Visual progress** - See upload status for each emoji (pending, uploading, success, error)
- **Rate limit handling** - Built-in delays between uploads to avoid Slack's rate limits

## Installation

1. Install a userscript manager extension:
   - [ViolentMonkey](https://violentmonkey.github.io/) (recommended)
   - [Tampermonkey](https://www.tampermonkey.net/)

2. Click the link below to install the script:
   - [Install slack-bulk-emoji-uploader.user.js](../../raw/main/slack-bulk-emoji-uploader.user.js)

   Or manually:
   - Click your userscript manager icon
   - Create a new script
   - Copy and paste the contents of `slack-bulk-emoji-uploader.user.js`
   - Save

## Usage

1. Navigate to your Slack workspace's emoji customization page:
   ```
   https://YOUR-WORKSPACE.slack.com/customize/emoji
   ```

2. Look for the green **"+ Bulk Upload"** button (appears near the add emoji section, or as a floating button in the bottom-right corner)

3. Click to open the bulk upload modal

4. Add emoji images:
   - Drag & drop images onto the dropzone, or
   - Click "browse files" to select multiple images

5. Review and edit emoji names as needed:
   - Invalid names will show a red border
   - Names are auto-sanitized from filenames

6. Click **"Upload All"** to upload

## Emoji Name Rules

Slack emoji names must follow these rules:
- Lowercase letters, numbers, underscores (`_`), and hyphens (`-`) only
- Must start and end with a letter or number
- 1-100 characters in length

The script automatically sanitizes filenames to meet these requirements.

## Troubleshooting

**"Could not find API token" error**
- Make sure you're logged into Slack in the browser
- Refresh the page and try again

**Upload fails with "emoji_limit_reached"**
- Your workspace has hit its custom emoji limit

**Upload fails with "error_name_taken"**
- An emoji with that name already exists; rename it and try again

## License

MIT License - see [LICENSE](LICENSE) for details.
