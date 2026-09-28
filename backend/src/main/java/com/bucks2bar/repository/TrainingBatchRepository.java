package com.bucks2bar.repository;

import com.bucks2bar.model.TrainingBatch;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface TrainingBatchRepository extends JpaRepository<TrainingBatch, Long> {
  Optional<TrainingBatch> findByName(String name);

  @Query("select distinct batch from TrainingBatch batch left join fetch batch.mentor left join fetch batch.candidates order by batch.name")
  List<TrainingBatch> findAllByOrderByNameAsc();
}
