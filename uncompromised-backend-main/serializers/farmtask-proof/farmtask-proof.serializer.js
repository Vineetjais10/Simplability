const farmTaskProofSerializer = (farmTaskProof, proofMedia) => {
  if (!farmTaskProof) return null;
  proofMedia = !Array.isArray(proofMedia) ? [proofMedia] : proofMedia;

  return {
    id: farmTaskProof.id,
    farmtask_id: farmTaskProof.farmtask_id,
    comments: farmTaskProof.comments,
    type: farmTaskProof.type,
    created_at: farmTaskProof.created_at,
    updated_at: farmTaskProof.updated_at,
    proof_media:
      proofMedia?.map(media => ({
        type: media.type,
        path: media.path
      })) || []
  };
};

module.exports = {
  farmTaskProofSerializer
};
