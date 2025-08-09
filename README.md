# NotionBridge Docs – Overview & Quickstart

## What you'll find in these docs

The documentation provides practical examples and explanations for all core features of **NotionBridge**:

- **Databases**
  - `getDatabaseProperties`: Fetch the structure and fields of a database
  - `createDatabase`: Create a new database
  - `queryAllDatabase`: Query a database with filters

- **Pages**
  - `createPage`: Create a new page with simple property objects  
  - `getPage`: Load all metadata and properties of a page  
  - `updatePage`: Update properties, icon, cover, or archived status  
  - `updatePages`: Update multiple pages’ properties, icon, cover, or archived status in one call  
  - `archivePage`: Archive a page  
  - `addSelectOption`: Add and select a new value for a select or multi_select property (automatically updates schema)

- **Blocks**
  - `getBlockChildren`: Fetch all child blocks of a page or block (including pagination)
  - `appendBlockChildren`: Add new blocks (paragraphs, lists, to-dos, etc.)
  - `deleteBlock`: Delete/archive a block
  - `clearPage`: Remove all child blocks from a page

- **Extras**
  - `mapResponse`: Simplifies raw Notion responses for further processing
  - `markdownToBlocks`: Converts markdown pages into notation blocks (only normal markdown pages)
  - `blocksToMarkdown`: Converts Notion block objects (array) into a Markdown string

Each page includes:
- Parameter tables
- Example calls
- Example responses
- Notes on supported property types and filter syntax

## Quickstart: Using NotionBridge

1. **Installation**
   ```bash
   npm install git+https://github.com/Squidiis/NotionBridge.git
   ```

2. **Create an integration token**
   - Go to [notion.com/my-integrations](https://www.notion.com/my-integrations), create a new integration token, and add it to your Notion workspace.

3. **Share your database with the integration**
   - Open the database in Notion, click "Share", and invite your integration.

4. **Example code**
   ```js
   import notionbridge from 'notionbridge';

   const notion = notionbridge('secret_abc123xyz456'); // Your integration token

   // Example: Query all pages in a database
   const entries = await notion.queryAllDatabase('your-database-id');
   console.log(entries);

   // Create a new page
   const newPage = await notion.createPage('your-database-id', {
     Name: 'New Task',
     Status: 'Open'
   });
   ```

5. **Pay attention to property names**
   - Property names must match exactly as written in Notion (including spaces, emojis, capitalization).
   - Use `getDatabaseProperties` or `getBlockChildren` to see all valid fields.

**For more details, examples, and tips, see the individual HTML documentation pages in the `content/` folder.**
