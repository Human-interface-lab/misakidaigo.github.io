import React, { useState, useRef } from 'react';
import { useDrop } from 'react-dnd';
import './CanvasArea.css';
import CanvasItem from '../CanvasItem/CanvasItem';
import ConnectionLines from '../CanvasItem/ConnectionLines';
import { getIdeaPrompt, getCombinePrompt } from '../../prompts/promptUtils';
import { generateDecomposeElements } from '../../prompts/generateDecomposeElemnets';

let nextId = 1000;

function CanvasArea({ topic, items, setItems, connections, setConnections, onDelete, addLog, direction }) {
  const canvasRef = useRef(null);

  async function generateIdeaFromTopic(topic, type, existingTitles) {
    const prompt = getIdeaPrompt(topic, type, existingTitles, direction);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.8,
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';

    let title = 'Untitled';
    let description = '';
    if (type === 'IDEA_TEMPLATE') {
      const mT = text.match(/Title[:：]?\s*(.+)/i);
      const mD = text.match(/Description[:：]?\s*(.+)/i);
      if (mT) title = mT[1].trim();
      if (mD) description = mD[1].trim();
    } else {
      const mT = text.match(/Title[:：]?\s*(.+)/i);
      if (mT) title = mT[1].trim();
    }
    return { title, description };
  }

  async function generateCombinedIdea(topic, sourceTitle, targetTitle) {
    const prompt = getCombinePrompt(topic, sourceTitle, targetTitle, direction);
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.85,
      }),
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim() || '';
    const mT = text.match(/Title[:：]?\s*(.+)/i);
    const mD = text.match(/Description[:：]?\s*(.+)/i);
    const title = mT ? mT[1].trim() : 'Combined Idea';
    const description = mD ? mD[1].trim() : `Based on ${sourceTitle} + ${targetTitle}`;
    return { title, description };
  }

  const [{ isOver }, dropRef] = useDrop({
    accept: ['IDEA_TEMPLATE', 'ELEMENT_TEMPLATE', 'CREATE_TEMPLATE'],
    drop: async (item, monitor) => {
      const offset = monitor.getClientOffset();
      const { left, top } = canvasRef.current.getBoundingClientRect();
      const x = offset.x - left - 100;
      const y = offset.y - top - 50;
      const existingTitles = items.map(i => i.title);

      let title = '';
      let description = '';
      if (item.type === 'IDEA_TEMPLATE' || item.type === 'ELEMENT_TEMPLATE') {
        let res = null;
        const maxRetries = 4;
        let attempt = 0;

        while (attempt < maxRetries) {
          res = await generateIdeaFromTopic(topic, item.type, existingTitles, direction);
          if (!existingTitles.includes(res.title)) break;
          console.warn(`[중복 아이디어 무시됨] "${res.title}" (재시도 ${attempt + 1})`);
          attempt++;
        }

        if (!res || existingTitles.includes(res.title)) {
          console.warn(`[최대 재시도 초과] 중복된 아이디어로 생성되지 않음`);
          return;
        }

        title = res.title;
        description = res.description;
        console.log(`[New ${item.type === 'IDEA_TEMPLATE' ? 'Idea' : 'Element'}] ${title}`);
      }

      const newItem = {
        id: nextId++,
        type: item.type === 'IDEA_TEMPLATE' ? 'idea' : item.type === 'ELEMENT_TEMPLATE' ? 'element' : 'create',
        title,
        description,
        x,
        y,
      };
      setItems(prev => [...prev, newItem]);
      addLog(
        `[New ${newItem.type === 'idea' ? 'Idea' : 'Element'}] ${newItem.title}`,
        [newItem.id]
      );
    },
    collect: monitor => ({ isOver: monitor.isOver() }),
  });

  const handleMove = (id, newX, newY) =>
    setItems(prev => prev.map(i => i.id === id ? { ...i, x: newX - 60, y: newY - 40 } : i));


  const handleCombine = (src, tgt) => {
    const source = items.find(i => i.id === src.id);
    const target = items.find(i => i.id === tgt.id);
    if (!source || !target) return;
    const x = (source.x + target.x) / 2;
    const y = (source.y + target.y) / 2;

    generateCombinedIdea(topic, source.title, target.title)
      .then(res => {
        const newIdea = {
          id: nextId++,
          type: 'idea',
          title: res.title,
          description: res.description,
          x,
          y
        };
        setItems(prev => [...prev, newIdea]);
        setConnections(prev => [
          ...prev,
          { from: source.id, to: newIdea.id },
          { from: target.id, to: newIdea.id }
        ]);
        // ← 여기서 newIdea를 참조해서 로그를 찍습니다

        console.log(
          `[Combined] ${source.title} + ${target.title} → ${newIdea.title}`
        );
        addLog(
          `[Combined] ${source.title} + ${target.title} → ${newIdea.title}`,
          [source.id, target.id, newIdea.id]
        );
      })
  };

  const handleDecompose = async (item) => {
    const source = items.find(i => i.id === item.id);
    if (!source) return;

    // GPT로부터 3개 요소 생성
    const elems = await generateDecomposeElements(topic, source.title);
    if (!elems.length) return;

    // 반경과 각도 설정
    const baseX = source.x;
    const baseY = source.y + 150;

    const spacing = 150;
    const x_positions = [-spacing, 0, spacing];
    const y_positions = [0, spacing, 0];


    // 새 요소 아이템 생성
    const newItems = elems.map((title, idx) => ({
      id: nextId++,
      type: 'element',
      title,
      description: '',
      x: baseX + x_positions[idx],
      y: baseY + y_positions[idx],
    }));

    // items 상태 업데이트
    setItems(prev => [...prev, ...newItems]);

    // 연결선 상태 업데이트
    const newConns = newItems.map(el => ({
      from: source.id,
      to: el.id,
    }));
    setConnections(prev => [...prev, ...newConns]);
    console.log(
      `[Decomposed] ${source.title} → Elements: ${elems.join(', ')}`
    );
  };

  return (
    <div
      ref={node => { dropRef(node); canvasRef.current = node; }}
      className="canvas-area"
      style={{ backgroundColor: isOver ? '#f0f9ff' : '#ffffff' }}
    >
      <ConnectionLines items={items} connections={connections} />
      {items.map(item => (
        <CanvasItem
          key={item.id}
          item={item}
          onMove={handleMove}
          onCombine={handleCombine}
          onDecompose={handleDecompose}
          onEdit={(id, newText) => {
            setItems(prev =>
              prev.map(i => i.id === id ? { ...i, title: newText } : i)
            );
          }}
        />
      ))}
    </div>
  );
}

export default CanvasArea;
