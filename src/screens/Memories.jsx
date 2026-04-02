import React from 'react';
import SEO from '../components/SEO';
import MemoryManager from '../components/MemoryManager';

export const Memories = () => {
  return (
    <>
      <SEO
        title="Memory Manager - Personal Notes & Thoughts"
        description="Organize and manage your personal memories, notes, and thoughts with our advanced memory management system."
        keywords={[
          'memory manager',
          'personal notes',
          'thoughts organizer',
          'digital journal',
          'note taking',
          'personal knowledge base',
          'memory organization',
          'thought management'
        ]}
        type="website"
      />
      <MemoryManager />
    </>
  );
};

export default Memories;
