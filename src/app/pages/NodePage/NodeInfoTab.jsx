import { useState, useContext, useEffect } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { foundation } from 'react-syntax-highlighter/src/styles/hljs';
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql';
import { format } from 'sql-formatter';
import NodeStatus from './NodeStatus';
import ListGroupItem from '../../components/ListGroupItem';
import ToggleSwitch from '../../components/ToggleSwitch';
import DJClientContext from '../../providers/djclient';

SyntaxHighlighter.registerLanguage('sql', sql);
foundation.hljs['padding'] = '2rem';

export default function NodeInfoTab({ node }) {
  const [compiledSQL, setCompiledSQL] = useState('');
  const [checked, setChecked] = useState(false);
  const nodeTags = node?.tags.map(tag => <div>{tag}</div>);
  const djClient = useContext(DJClientContext).DataJunctionAPI;
  useEffect(() => {
    const fetchData = async () => {
      const data = await djClient.compiledSql(node.name);
      if (data.sql) {
        setCompiledSQL(data.sql);
      } else {
        setCompiledSQL('/* Ran into an issue while generating compiled SQL */');
      }
    };
    fetchData().catch(console.error);
  }, [node, djClient]);
  function toggle(value) {
    return !value;
  }
  const queryDiv = node?.query ? (
    <div className="list-group-item d-flex">
      <div className="d-flex gap-2 w-100 justify-content-between py-3">
        <div
          style={{
            width: window.innerWidth * 0.8,
          }}
        >
          <h6 className="mb-0 w-100">Query</h6>
          {['metric', 'dimension', 'transform'].indexOf(node?.type) > -1 ? (
            <ToggleSwitch
              id="toggleSwitch"
              checked={checked}
              onChange={() => setChecked(toggle)}
              toggleName="Show Compiled SQL"
            />
          ) : (
            <></>
          )}
          <SyntaxHighlighter language="sql" style={foundation}>
            {checked
              ? format(compiledSQL, {
                  language: 'spark',
                  tabWidth: 2,
                  keywordCase: 'upper',
                  denseOperators: true,
                  logicalOperatorNewline: 'before',
                  expressionWidth: 10,
                })
              : format(node?.query, {
                  language: 'spark',
                  tabWidth: 2,
                  keywordCase: 'upper',
                  denseOperators: true,
                  logicalOperatorNewline: 'before',
                  expressionWidth: 10,
                })}
          </SyntaxHighlighter>
        </div>
      </div>
    </div>
  ) : (
    <></>
  );
  return (
    <div className="list-group align-items-center justify-content-between flex-md-row gap-2">
      <ListGroupItem label="Description" value={node?.description} />
      <div className="list-group-item d-flex">
        <div className="d-flex gap-2 w-100 justify-content-between py-3">
          <div>
            <h6 className="mb-0 w-100">Version</h6>

            <p className="mb-0 opacity-75">
              <span
                className="rounded-pill badge bg-secondary-soft"
                style={{ marginLeft: '0.5rem', fontSize: '100%' }}
              >
                {node?.version}
              </span>
            </p>
          </div>
          <div>
            <h6 className="mb-0 w-100">Status</h6>
            <p className="mb-0 opacity-75">
              <NodeStatus node={node} />
            </p>
          </div>
          <div>
            <h6 className="mb-0 w-100">Mode</h6>
            <p className="mb-0 opacity-75">
              <span className="status">{node?.mode}</span>
            </p>
          </div>
          <div>
            <h6 className="mb-0 w-100">Tags</h6>
            <p className="mb-0 opacity-75">{nodeTags}</p>
          </div>
        </div>
      </div>
      {queryDiv}
      <div className="list-group-item d-flex">{node?.primary_key}</div>
    </div>
  );
}
