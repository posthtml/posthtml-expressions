## Modules

<dl>
<dt><a href="#module_backup">backup</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#module_escape">escape</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#module_posthtml-expressions">posthtml-expressions</a> ⇒ <code>Object</code></dt>
<dd><p>Expressions Plugin for PostHTML</p>
</dd>
<dt><a href="#module_loops">loops</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#module_placeholders">placeholders</a> : <code>function</code></dt>
<dd></dd>
<dt><a href="#module_tags">tags</a> : <code>function</code></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#makeLocalsBackup">makeLocalsBackup(keys, locals)</a> ⇒ <code>Object</code></dt>
<dd><p>Creates a backup of keys values</p>
</dd>
<dt><a href="#revertBackupedLocals">revertBackupedLocals(keys, locals, backup)</a> ⇒ <code>Object</code></dt>
<dd><p>Returns the original keys values</p>
</dd>
<dt><a href="#escapeRegexpString">escapeRegexpString(input)</a> ⇒ <code>function</code></dt>
<dd><p>Replace String based on RegExp</p>
</dd>
<dt><a href="#executeLoop">executeLoop(params, p1, p2, locals, tree)</a> ⇒ <code>function</code></dt>
<dd><p>Creates a set of local variables within the loop, and evaluates all nodes within the loop, returning their contents</p>
</dd>
<dt><a href="#executeScope">executeScope(scope, locals, node)</a> ⇒ <code>function</code></dt>
<dd><p>Runs walk function with arbitrary set of local variables</p>
</dd>
<dt><a href="#getLoopMeta">getLoopMeta(index, target)</a> ⇒ <code>Object</code></dt>
<dd><p>Returns an object containing loop metadata</p>
</dd>
<dt><a href="#parseLoopStatement">parseLoopStatement(input)</a> ⇒ <code>Object</code></dt>
<dd><p>Given a &quot;loop&quot; parameter from an &quot;each&quot; tag, parses out the param names and expression to be looped.</p>
</dd>
<dt><a href="#escapeHTML">escapeHTML(unescaped)</a> ⇒ <code>String</code></dt>
<dd><p>Escape HTML characters with their respective entities</p>
</dd>
<dt><a href="#placeholders">placeholders(input, ctx, settings, opts)</a> ⇒ <code>String</code></dt>
<dd><p>Replace Expressions</p>
</dd>
<dt><a href="#getNextTag">getNextTag(nodes, i)</a> ⇒ <code>Array</code></dt>
<dd><p>Get the next tag from a node list</p>
</dd>
</dl>

<a name="module_backup"></a>

## backup : <code>Object</code>
**Requires**: <code>module:fclone</code>  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| make | <code>function</code> | Make Locals backup |
| revert | <code>function</code> | Revert backuped Locals |

<a name="module_escape"></a>

## escape : <code>function</code>
<a name="module_posthtml-expressions"></a>

## posthtml-expressions ⇒ <code>Object</code>
Expressions Plugin for PostHTML

**Returns**: <code>Object</code> - tree PostHTML Tree  
**Requires**: <code>module:vm</code>, <code>module:./tags</code>, <code>module:./loops</code>, <code>module:./escape</code>, <code>module:./backup</code>, <code>module:./placeholders</code>  
**Version**: 1.0.0  
**Author**: Jeff Escalante Denis (@jescalan),
        Denis Malinochkin (mrmlnc),
        Michael Ciniawsky (@michael-ciniawsky)  
**License**: MIT  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Object</code> | Options |

<a name="module_loops"></a>

## loops : <code>function</code>
<a name="module_placeholders"></a>

## placeholders : <code>function</code>
**Requires**: <code>module:vm</code>  
<a name="module_tags"></a>

## tags : <code>function</code>
<a name="makeLocalsBackup"></a>

## makeLocalsBackup(keys, locals) ⇒ <code>Object</code>
Creates a backup of keys values

**Kind**: global function  
**Returns**: <code>Object</code> - backup Backup Locals  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>Object</code> | Keys |
| locals | <code>Object</code> | Locals |

<a name="revertBackupedLocals"></a>

## revertBackupedLocals(keys, locals, backup) ⇒ <code>Object</code>
Returns the original keys values

**Kind**: global function  
**Returns**: <code>Object</code> - locals Reverted Locals  

| Param | Type | Description |
| --- | --- | --- |
| keys | <code>Object</code> | Keys |
| locals | <code>Object</code> | Locals |
| backup | <code>Object</code> | Backup |

<a name="escapeRegexpString"></a>

## escapeRegexpString(input) ⇒ <code>function</code>
Replace String based on RegExp

**Kind**: global function  
**Returns**: <code>function</code> - input Replaced Input  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | Input |

<a name="executeLoop"></a>

## executeLoop(params, p1, p2, locals, tree) ⇒ <code>function</code>
Creates a set of local variables within the loop, and evaluates all nodes within the loop, returning their contents

**Kind**: global function  
**Returns**: <code>function</code> - walk  Walks the tree and parses all locals within the loop  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>Array</code> | Parameters |
| p1 | <code>String</code> | Parameter 1 |
| p2 | <code>String</code> | Parameter 2 |
| locals | <code>Object</code> | Locals |
| tree | <code>String</code> | Tree |

<a name="executeScope"></a>

## executeScope(scope, locals, node) ⇒ <code>function</code>
Runs walk function with arbitrary set of local variables

**Kind**: global function  
**Returns**: <code>function</code> - walk Walks the tree and parses all locals in scope  

| Param | Type | Description |
| --- | --- | --- |
| scope | <code>Object</code> | Scoped Locals |
| locals | <code>Object</code> | Locals |
| node | <code>Object</code> | Node |

<a name="getLoopMeta"></a>

## getLoopMeta(index, target) ⇒ <code>Object</code>
Returns an object containing loop metadata

**Kind**: global function  
**Returns**: <code>Object</code> - Object containing loop metadata  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>Integer</code> \| <code>Object</code> | Current iteration |
| target | <code>Object</code> | Object being iterated |

<a name="parseLoopStatement"></a>

## parseLoopStatement(input) ⇒ <code>Object</code>
Given a "loop" parameter from an "each" tag, parses out the param names and expression to be looped.

**Kind**: global function  
**Returns**: <code>Object</code> - {}    Keys && Expression  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | Input |

<a name="escapeHTML"></a>

## escapeHTML(unescaped) ⇒ <code>String</code>
Escape HTML characters with their respective entities

**Kind**: global function  
**Returns**: <code>String</code> - escaped   Save HTML  

| Param | Type | Description |
| --- | --- | --- |
| unescaped | <code>String</code> | Unsafe HTML |

<a name="placeholders"></a>

## placeholders(input, ctx, settings, opts) ⇒ <code>String</code>
Replace Expressions

**Kind**: global function  
**Returns**: <code>String</code> - input Replaced Input  

| Param | Type | Description |
| --- | --- | --- |
| input | <code>String</code> | Input |
| ctx | <code>Object</code> | Context |
| settings | <code>Array</code> | Settings |
| opts | <code>Array</code> | Options |

<a name="getNextTag"></a>

## getNextTag(nodes, i) ⇒ <code>Array</code>
Get the next tag from a node list

**Kind**: global function  
**Returns**: <code>Array</code> - []    Array containing the next tag  

| Param | Type | Description |
| --- | --- | --- |
| nodes | <code>Array</code> | Nodes |
| i | <code>Number</code> | Accumulator |

